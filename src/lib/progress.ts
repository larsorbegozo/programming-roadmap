import { allLessons, curriculum } from '../data/curriculum';
import { allMilestones, type MilestoneDefinition } from '../data/milestones';
import type { Lesson, Phase } from '../types/curriculum';
import type { AppState, StudyCategory, StudySession } from '../types/state';
import { addDays, fromDateKey, todayKey, toDateKey, weekStartKey } from './dates';

export function percent(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((done / total) * 100);
}

export function isLessonComplete(state: AppState, lessonId: string): boolean {
  return Boolean(state.completedLessons[lessonId]);
}

export interface PhaseProgress {
  phase: Phase;
  completed: number;
  total: number;
  percent: number;
  status: 'not-started' | 'in-progress' | 'completed';
}

export function getPhaseProgress(state: AppState, phase: Phase): PhaseProgress {
  const total = phase.lessons.length;
  const completed = phase.lessons.filter((l) => isLessonComplete(state, l.id)).length;
  const status = completed === 0 ? 'not-started' : completed === total ? 'completed' : 'in-progress';
  return { phase, completed, total, percent: percent(completed, total), status };
}

export function getAllPhaseProgress(state: AppState): PhaseProgress[] {
  return curriculum.map((p) => getPhaseProgress(state, p));
}

export function getOverallProgress(state: AppState) {
  const total = allLessons.length;
  const completed = allLessons.filter((l) => isLessonComplete(state, l.id)).length;
  return { completed, total, percent: percent(completed, total) };
}

/** The first incomplete lesson in roadmap order, or null when everything is done. */
export function getNextLesson(state: AppState): Lesson | null {
  return allLessons.find((l) => !isLessonComplete(state, l.id)) ?? null;
}

/** Current phase = phase of the next lesson; falls back to the last phase when all done. */
export function getCurrentPhase(state: AppState): Phase {
  const next = getNextLesson(state);
  const last = curriculum[curriculum.length - 1] as Phase;
  if (!next) return last;
  return curriculum.find((p) => p.id === next.phaseId) ?? last;
}

/**
 * Remaining weeks, based on each phase's estimate (written for ~10 h/week),
 * scaled by the remaining fraction of the phase and the user's weekly target.
 */
export function getRemainingWeeks(state: AppState): number {
  const base = curriculum.reduce((sum, phase) => {
    const { completed, total } = getPhaseProgress(state, phase);
    return sum + phase.estimatedWeeks * (total === 0 ? 0 : 1 - completed / total);
  }, 0);
  const scale = 10 / Math.max(1, state.settings.weeklyHoursTarget);
  return base * scale;
}

export function formatWeeks(weeks: number): string {
  if (weeks <= 0) return 'Done';
  if (weeks < 1) {
    const days = Math.max(1, Math.round(weeks * 7));
    return `~${days} day${days === 1 ? '' : 's'}`;
  }
  const rounded = Math.round(weeks);
  return `~${rounded} week${rounded === 1 ? '' : 's'}`;
}

// ---------- Study sessions ----------

export function sessionsInWeek(sessions: StudySession[], weekKey: string): StudySession[] {
  const end = addDays(weekKey, 7);
  return sessions.filter((s) => s.date >= weekKey && s.date < end);
}

export function totalMinutes(sessions: StudySession[]): number {
  return sessions.reduce((sum, s) => sum + s.minutes, 0);
}

export function minutesByCategory(sessions: StudySession[]): Record<StudyCategory, number> {
  const result: Record<StudyCategory, number> = { theory: 0, practice: 0, revision: 0 };
  for (const s of sessions) result[s.category] += s.minutes;
  return result;
}

export const CATEGORY_SHARE: Record<StudyCategory, number> = { theory: 0.4, practice: 0.4, revision: 0.2 };

export const CATEGORY_LABEL: Record<StudyCategory, string> = {
  theory: 'Theory & lessons',
  practice: 'Practical coding',
  revision: 'Revision & experimentation',
};

/** Hours per category for a given weekly target. Default 10 h → 4 / 4 / 2. */
export function weeklyAllocation(targetHours: number): Record<StudyCategory, number> {
  const theory = Math.round(targetHours * CATEGORY_SHARE.theory);
  const practice = Math.round(targetHours * CATEGORY_SHARE.practice);
  const revision = Math.max(0, targetHours - theory - practice);
  return { theory, practice, revision };
}

export interface PlannedSlot {
  id: string;
  category: StudyCategory;
  index: number;
  minutes: number;
}

/** One 60-minute slot per allocated hour. Slot ids are stable per category/index. */
export function plannedSlots(targetHours: number): PlannedSlot[] {
  const alloc = weeklyAllocation(targetHours);
  const slots: PlannedSlot[] = [];
  (Object.keys(alloc) as StudyCategory[]).forEach((category) => {
    for (let i = 0; i < alloc[category]; i++) {
      slots.push({ id: `${category}-${i + 1}`, category, index: i + 1, minutes: 60 });
    }
  });
  return slots;
}

// ---------- Streaks ----------

/** Days with any recorded activity: study sessions or lesson completions. */
export function activityDays(state: AppState): Set<string> {
  const days = new Set<string>();
  for (const s of state.sessions) days.add(s.date);
  for (const iso of Object.values(state.completedLessons)) {
    const d = new Date(iso);
    if (!Number.isNaN(d.getTime())) days.add(toDateKey(d));
  }
  return days;
}

/** Consecutive active days ending today (or yesterday, so the streak survives until the day ends). */
export function currentStreak(state: AppState, today = todayKey()): number {
  const days = activityDays(state);
  let cursor = days.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(state: AppState): number {
  const sorted = [...activityDays(state)].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev && addDays(prev, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

// ---------- Milestones ----------

function hitWeeklyTarget(state: AppState): boolean {
  const target = state.settings.weeklyHoursTarget * 60;
  const byWeek = new Map<string, number>();
  for (const s of state.sessions) {
    const wk = weekStartKey(s.date);
    byWeek.set(wk, (byWeek.get(wk) ?? 0) + s.minutes);
  }
  return [...byWeek.values()].some((m) => m >= target);
}

export function isMilestoneMet(state: AppState, milestone: MilestoneDefinition): boolean {
  if (milestone.kind === 'phase') {
    const phase = curriculum.find((p) => p.id === milestone.phaseId);
    return phase ? getPhaseProgress(state, phase).status === 'completed' : false;
  }
  const overall = getOverallProgress(state);
  const hours = totalMinutes(state.sessions) / 60;
  switch (milestone.id) {
    case 'first-lesson':
      return overall.completed >= 1;
    case 'ten-lessons':
      return overall.completed >= 10;
    case 'halfway':
      return overall.percent >= 50;
    case 'hours-10':
      return hours >= 10;
    case 'hours-50':
      return hours >= 50;
    case 'hours-100':
      return hours >= 100;
    case 'streak-7':
      return longestStreak(state) >= 7;
    case 'full-week':
      return hitWeeklyTarget(state);
    default:
      return false;
  }
}

/** Returns the achievements map that matches current state, keeping original dates. */
export function reconcileAchievements(state: AppState): Record<string, string> {
  const next: Record<string, string> = {};
  const now = new Date().toISOString();
  for (const m of allMilestones) {
    if (isMilestoneMet(state, m)) next[m.id] = state.achievements[m.id] ?? now;
  }
  return next;
}

export function sameKeys(a: Record<string, string>, b: Record<string, string>): boolean {
  const ak = Object.keys(a);
  return ak.length === Object.keys(b).length && ak.every((k) => k in b);
}

/** Suggested weekly objective: the next few incomplete lessons. */
export function suggestedWeeklyObjective(state: AppState): string {
  const next = getNextLesson(state);
  if (!next) return 'Keep building and polishing Lyra.';
  const phase = curriculum.find((p) => p.id === next.phaseId);
  if (!phase) return '';
  const remaining = phase.lessons.filter((l) => !isLessonComplete(state, l.id));
  const lessonsPerWeek = Math.max(2, Math.round(phase.lessons.length / Math.max(1, phase.estimatedWeeks)));
  const batch = remaining.slice(0, lessonsPerWeek);
  const first = batch[0];
  const last = batch[batch.length - 1];
  if (!first || !last) return '';
  const range = first === last ? `lesson ${first.number}` : `lessons ${first.number}–${last.number}`;
  return `Phase ${phase.number}: complete ${range} (${first.title}${first === last ? '' : ` → ${last.title}`}).`;
}

export function daysSince(dateKey: string): number {
  const ms = fromDateKey(todayKey()).getTime() - fromDateKey(dateKey).getTime();
  return Math.round(ms / 86_400_000);
}
