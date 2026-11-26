/**
 * Merging two copies of the progress document (this device vs the cloud).
 *
 * Almost everything the learner does only ever adds things (completing a lesson, logging a
 * session, passing a checkpoint), so a union keeps both devices' work. The few scalar fields
 * (settings, current phase…) take the copy named by `prefer`.
 *
 * Known limitation: if two devices changed the same thing at the same time, deletions made on
 * one of them can come back after the merge (for example an un-ticked lesson). That only happens
 * when both devices have unsynced changes; the normal one-device-at-a-time flow overwrites cleanly.
 */
import type { AppState, CheckpointProgress, ExamAttempt, ProblemProgress, StudySession } from '../../types/state';
import { createInitialState } from '../validation';

export type Prefer = 'local' | 'remote';

/** True when the document holds anything the learner did (as opposed to a fresh install). */
export function hasProgress(state: AppState): boolean {
  return (
    Object.keys(state.completedLessons).length > 0 ||
    Object.keys(state.completedExercises).length > 0 ||
    Object.keys(state.notes).length > 0 ||
    state.sessions.length > 0 ||
    Object.keys(state.weeklyGoals).length > 0 ||
    Object.keys(state.checkpoints).length > 0 ||
    Object.keys(state.examAttempts).length > 0 ||
    state.examPlan !== null ||
    state.activeExam !== null ||
    state.settings.weeklyHoursTarget !== createInitialState().settings.weeklyHoursTarget
  );
}

const earlier = (a: string | undefined, b: string | undefined): string | undefined => (a && b ? (a < b ? a : b) : (a ?? b));

function unionDates(a: Record<string, string>, b: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = { ...a };
  for (const [key, date] of Object.entries(b)) out[key] = earlier(out[key], date) as string;
  return sortKeys(out);
}

function sortKeys<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(record).sort(([x], [y]) => (x < y ? -1 : x > y ? 1 : 0)));
}

function mergeNotes(a: Record<string, string>, b: Record<string, string>, prefer: Prefer): Record<string, string> {
  const out: Record<string, string> = { ...a };
  for (const [key, text] of Object.entries(b)) {
    const mine = out[key];
    if (mine === undefined || mine === text) out[key] = text;
    // Both devices wrote different notes for the same lesson: keep the longer one so nothing typed is lost.
    else if (text.length !== mine.length) out[key] = text.length > mine.length ? text : mine;
    else out[key] = prefer === 'remote' ? text : mine;
  }
  return sortKeys(out);
}

function mergeSessions(a: StudySession[], b: StudySession[]): StudySession[] {
  const byId = new Map<string, StudySession>();
  for (const s of [...b, ...a]) byId.set(s.id, s);
  return [...byId.values()].sort((x, y) => (x.date === y.date ? (x.id < y.id ? -1 : 1) : x.date < y.date ? -1 : 1));
}

function mergeProblems(a: Record<string, ProblemProgress>, b: Record<string, ProblemProgress>, prefer: Prefer): Record<string, ProblemProgress> {
  const out: Record<string, ProblemProgress> = {};
  for (const id of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[id];
    const y = b[id];
    if (!x || !y) {
      out[id] = (x ?? y) as ProblemProgress;
      continue;
    }
    const passedAt = earlier(x.passedAt, y.passedAt);
    // Show the learner's code from the preferred side, unless only the other side has a passing solution.
    const first = prefer === 'remote' ? y : x;
    const second = prefer === 'remote' ? x : y;
    const code = first.passedAt || !second.passedAt ? first.code : second.code;
    out[id] = { code, ...(passedAt ? { passedAt } : {}) };
  }
  return sortKeys(out);
}

function mergeCheckpoints(a: Record<string, CheckpointProgress>, b: Record<string, CheckpointProgress>, prefer: Prefer): Record<string, CheckpointProgress> {
  const out: Record<string, CheckpointProgress> = {};
  for (const phaseId of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[phaseId];
    const y = b[phaseId];
    if (!x || !y) {
      out[phaseId] = (x ?? y) as CheckpointProgress;
      continue;
    }
    const merged: CheckpointProgress = { problems: mergeProblems(x.problems, y.problems, prefer) };
    if (x.quiz || y.quiz) {
      const passedAt = earlier(x.quiz?.passedAt, y.quiz?.passedAt);
      merged.quiz = {
        bestScore: Math.max(x.quiz?.bestScore ?? 0, y.quiz?.bestScore ?? 0),
        attempts: Math.max(x.quiz?.attempts ?? 0, y.quiz?.attempts ?? 0),
        ...(passedAt ? { passedAt } : {}),
      };
    }
    out[phaseId] = merged;
  }
  return sortKeys(out);
}

function mergeAttempts(a: Record<string, ExamAttempt[]>, b: Record<string, ExamAttempt[]>): Record<string, ExamAttempt[]> {
  const out: Record<string, ExamAttempt[]> = {};
  for (const phaseId of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const seen = new Map<string, ExamAttempt>();
    for (const attempt of [...(a[phaseId] ?? []), ...(b[phaseId] ?? [])]) seen.set(`${attempt.sitting}|${attempt.submittedAt}`, attempt);
    out[phaseId] = [...seen.values()].sort((x, y) => x.sitting - y.sitting || (x.submittedAt < y.submittedAt ? -1 : 1));
  }
  return sortKeys(out);
}

export function mergeStates(local: AppState, remote: AppState, prefer: Prefer): AppState {
  const [first, second] = prefer === 'remote' ? [remote, local] : [local, remote];

  const examAttempts = mergeAttempts(local.examAttempts, remote.examAttempts);

  // Two exams "in progress": keep the one that started first. Drop it if that sitting was already submitted.
  const candidates = [local.activeExam, remote.activeExam].filter((e): e is NonNullable<AppState['activeExam']> => Boolean(e));
  candidates.sort((x, y) => (x.startedAt < y.startedAt ? -1 : x.startedAt > y.startedAt ? 1 : 0));
  const activeExam = candidates[0] && !(examAttempts[candidates[0].phaseId] ?? []).some((a) => a.sitting === candidates[0]?.sitting) ? candidates[0] : null;

  // A re-plan is deliberate, so the newest calendar wins whichever side it came from.
  const plans = [local.examPlan, remote.examPlan].filter((p): p is NonNullable<AppState['examPlan']> => Boolean(p));
  plans.sort((x, y) => (x.createdAt > y.createdAt ? -1 : x.createdAt < y.createdAt ? 1 : 0));

  return {
    version: 1,
    completedLessons: unionDates(local.completedLessons, remote.completedLessons),
    completedExercises: unionDates(local.completedExercises, remote.completedExercises),
    notes: mergeNotes(local.notes, remote.notes, prefer),
    sessions: mergeSessions(local.sessions, remote.sessions),
    weeklyGoals: sortKeys({ ...second.weeklyGoals, ...first.weeklyGoals }),
    lastViewedLessonId: first.lastViewedLessonId ?? second.lastViewedLessonId,
    currentPhaseId: first.currentPhaseId ?? second.currentPhaseId,
    achievements: unionDates(local.achievements, remote.achievements),
    checkpoints: mergeCheckpoints(local.checkpoints, remote.checkpoints, prefer),
    examPlan: plans[0] ?? null,
    examAttempts,
    activeExam,
    settings: { ...second.settings, ...first.settings },
  };
}
