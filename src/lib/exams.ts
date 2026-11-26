/**
 * Final exams, university style:
 * - Each phase ("unidad") has a deadline for its final ("mesa"), computed from the study pace.
 * - To sit a final you must be "regular" (all lessons done + checkpoint passed) and have passed
 *   the previous unit's final ("correlativa").
 * - One attempt per sitting. Fail or miss the deadline → retake ("recuperatorio") a week later.
 *   Fail that too → the unit is "libre": a new sitting every week, and every later unit shifts a week.
 */
import { curriculum } from '../data/curriculum';
import { getFinal } from '../data/finals';
import type { Phase } from '../types/curriculum';
import type { AppState, ExamAttempt, ExamPlan } from '../types/state';
import { addDays, fromDateKey, todayKey } from './dates';
import { isCheckpointPassed, isLessonComplete } from './progress';

export const PASS_PERCENT = 60;
export const PROBLEM_POINTS = 3;
export const SITTING_GAP_DAYS = 7;
const MIN_UNIT_DAYS = 3;
/** Estimated weeks in the curriculum assume this many study hours per week. */
const BASE_HOURS = 10;

// ---------- Calendar ----------

export interface PlanInput {
  startDate: string;
  hoursPerWeek: number;
  breakStart?: string;
  breakEnd?: string;
}

function isBreak(day: string, plan: PlanInput): boolean {
  return Boolean(plan.breakStart && plan.breakEnd && day >= plan.breakStart && day <= plan.breakEnd);
}

function skipBreak(day: string, plan: PlanInput): string {
  let d = day;
  while (isBreak(d, plan)) d = addDays(d, 1);
  return d;
}

/** The date of the n-th study (non-break) day, counting `start` as day 1 if it is a study day. */
function addStudyDays(start: string, n: number, plan: PlanInput): string {
  let d = start;
  let count = 0;
  for (let guard = 0; guard < 5000; guard++) {
    if (!isBreak(d, plan)) {
      count++;
      if (count >= n) return d;
    }
    d = addDays(d, 1);
  }
  return d;
}

/** Moves a date forward by `days` study days (0 returns the same date). */
function shiftStudyDays(day: string, days: number, plan: PlanInput): string {
  return days <= 0 ? day : addStudyDays(addDays(day, 1), days, plan);
}

export function unitStudyDays(phase: Phase, hoursPerWeek: number): number {
  return Math.max(MIN_UNIT_DAYS, Math.ceil(((phase.estimatedWeeks * BASE_HOURS) / Math.max(1, hoursPerWeek)) * 7));
}

/** Builds the calendar. A unit that would be cut in two by the break starts after it instead. */
export function generatePlan(input: PlanInput): ExamPlan {
  const units: ExamPlan['units'] = {};
  let cursor = input.startDate;
  for (const phase of curriculum) {
    const days = unitStudyDays(phase, input.hoursPerWeek);
    let start = skipBreak(cursor, input);
    let deadline = addStudyDays(start, days, input);
    if (input.breakStart && input.breakEnd && start < input.breakStart && deadline > input.breakEnd) {
      start = skipBreak(addDays(input.breakEnd, 1), input);
      deadline = addStudyDays(start, days, input);
    }
    units[phase.id] = { start, deadline };
    cursor = addDays(deadline, 1);
  }
  return {
    createdAt: new Date().toISOString(),
    startDate: input.startDate,
    hoursPerWeek: input.hoursPerWeek,
    ...(input.breakStart && input.breakEnd ? { breakStart: input.breakStart, breakEnd: input.breakEnd } : {}),
    units,
  };
}

// ---------- Grading ----------

/** Argentine university scale: 1–10, passing with 4 (= 60%). */
export function gradeFromPercent(percent: number): number {
  if (percent >= PASS_PERCENT) return Math.min(10, 4 + Math.floor((percent - PASS_PERCENT) / ((100 - PASS_PERCENT) / 6) + 1e-9));
  return Math.max(1, 1 + Math.floor(percent / 20));
}

export function sittingLabel(sitting: number): string {
  if (sitting === 0) return 'Final';
  if (sitting === 1) return 'Retake';
  return `Libre · sitting ${sitting - 1}`;
}

// ---------- Timeline ----------

export interface UnitExam {
  phase: Phase;
  hasFinal: boolean;
  /** Study window start, shifted by earlier "libre" units. */
  start: string;
  /** Deadline of the first sitting (shifted). */
  firstDeadline: string;
  /** Deadline of the retake sitting (shifted). */
  retakeDeadline: string;
  /** The sitting the learner is in now (or passed in). */
  sitting: number;
  /** Deadline of the current sitting. */
  deadline: string;
  attempts: ExamAttempt[];
  passedAttempt: ExamAttempt | null;
  /** Requirements not yet met to sit the exam. */
  blockers: string[];
  /** After a failed attempt the next sitting opens the following day. */
  availableFrom: string | null;
  /** Days from today to the current deadline (negative = overdue). */
  daysLeft: number;
  /** How many weeks earlier "libre" units pushed this unit back. */
  shiftWeeks: number;
  status: 'passed' | 'in-progress' | 'available' | 'not-eligible' | 'cooldown';
}

function daysBetween(from: string, to: string): number {
  return Math.round((fromDateKey(to).getTime() - fromDateKey(from).getTime()) / 86_400_000);
}

export function isFinalPassed(state: AppState, phaseId: string): boolean {
  return (state.examAttempts[phaseId] ?? []).some((a) => a.passed);
}

export function isRegular(state: AppState, phase: Phase): boolean {
  return phase.lessons.every((l) => isLessonComplete(state, l.id)) && isCheckpointPassed(state, phase.id);
}

/** Computes every unit's exam situation in order (later units depend on earlier "libre" shifts). */
export function getExamTimeline(state: AppState, today = todayKey()): UnitExam[] {
  const plan = state.examPlan;
  if (!plan) return [];
  const result: UnitExam[] = [];
  let offsetSittings = 0;
  let previous: { phase: Phase; passed: boolean } | null = null;

  for (const phase of curriculum) {
    const base = plan.units[phase.id];
    if (!base) continue;
    const final = getFinal(phase.id);
    const attempts = [...(state.examAttempts[phase.id] ?? [])].sort((a, b) => a.sitting - b.sitting);
    const passedAttempt = attempts.find((a) => a.passed) ?? null;
    const deadlineOf = (k: number) => shiftStudyDays(base.deadline, SITTING_GAP_DAYS * (offsetSittings + k), plan);

    let sitting = 0;
    if (passedAttempt) sitting = passedAttempt.sitting;
    else {
      for (let guard = 0; guard < 200; guard++) {
        const used = attempts.some((a) => a.sitting === sitting);
        if (used || today > deadlineOf(sitting)) sitting++;
        else break;
      }
    }
    // An exam in progress keeps the sitting it was started in.
    const active = state.activeExam?.phaseId === phase.id ? state.activeExam : null;
    if (active) sitting = active.sitting;

    const blockers: string[] = [];
    const lessonsLeft = phase.lessons.filter((l) => !isLessonComplete(state, l.id)).length;
    if (lessonsLeft > 0) blockers.push(`Complete the ${lessonsLeft} remaining lesson${lessonsLeft === 1 ? '' : 's'}`);
    if (!isCheckpointPassed(state, phase.id)) blockers.push('Pass the checkpoint');
    if (previous && !previous.passed) blockers.push(`Pass the Phase ${previous.phase.number} final first (prerequisite)`);

    const failed = attempts.filter((a) => !a.passed);
    const lastFailed = failed[failed.length - 1];
    const failedToday = lastFailed && lastFailed.submittedAt.slice(0, 10) === today ? lastFailed : null;
    const availableFrom = !passedAttempt && failedToday ? addDays(today, 1) : null;
    const deadline = deadlineOf(sitting);

    const status: UnitExam['status'] = passedAttempt
      ? 'passed'
      : active
        ? 'in-progress'
        : blockers.length > 0
          ? 'not-eligible'
          : availableFrom
            ? 'cooldown'
            : 'available';

    result.push({
      phase,
      hasFinal: Boolean(final),
      start: shiftStudyDays(base.start, SITTING_GAP_DAYS * offsetSittings, plan),
      firstDeadline: deadlineOf(0),
      retakeDeadline: deadlineOf(1),
      sitting,
      deadline,
      attempts,
      passedAttempt,
      blockers,
      availableFrom,
      daysLeft: daysBetween(today, deadline),
      shiftWeeks: offsetSittings,
      status,
    });

    // Every sitting beyond the retake pushes the rest of the calendar back a week.
    offsetSittings += Math.max(0, sitting - 1);
    previous = { phase, passed: Boolean(passedAttempt) };
  }
  return result;
}

export function getUnitExam(state: AppState, phaseId: string, today = todayKey()): UnitExam | undefined {
  return getExamTimeline(state, today).find((u) => u.phase.id === phaseId);
}

/** The next final that is not passed yet. */
export function getNextFinal(state: AppState, today = todayKey()): UnitExam | null {
  return getExamTimeline(state, today).find((u) => u.status !== 'passed') ?? null;
}

export function averageGrade(state: AppState): number | null {
  const grades = curriculum.map((p) => (state.examAttempts[p.id] ?? []).find((a) => a.passed)?.grade).filter((g): g is number => typeof g === 'number');
  if (grades.length === 0) return null;
  return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100;
}

export function formatCountdown(days: number): string {
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return days > 0 ? `in ${days} days` : `${-days} days ago`;
}
