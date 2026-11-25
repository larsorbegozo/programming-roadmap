import { allExerciseIds, allLessons, curriculum } from '../data/curriculum';
import { checkpoints as checkpointDefs } from '../data/checkpoints';
import { allMilestones } from '../data/milestones';
import type { AppState, CheckpointProgress, StudyCategory, StudySession } from '../types/state';
import { isValidDateKey } from './dates';

export const MIN_WEEKLY_HOURS = 1;
export const MAX_WEEKLY_HOURS = 40;
export const MAX_SESSION_MINUTES = 16 * 60;
export const MAX_CODE_LENGTH = 50_000;

export function createInitialState(): AppState {
  return {
    version: 1,
    completedLessons: {},
    completedExercises: {},
    notes: {},
    sessions: [],
    weeklyGoals: {},
    lastViewedLessonId: null,
    currentPhaseId: null,
    achievements: {},
    checkpoints: {},
    settings: { weeklyHoursTarget: 10 },
  };
}

export type ValidationResult = { ok: true; state: AppState; warnings: string[] } | { ok: false; errors: string[] };

const lessonIds = new Set(allLessons.map((l) => l.id));
const exerciseIds = new Set(allExerciseIds);
const phaseIds = new Set(curriculum.map((p) => p.id));
const milestoneIds = new Set(allMilestones.map((m) => m.id));
const categories: StudyCategory[] = ['theory', 'practice', 'revision'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

/** Validate a record of id -> ISO date, dropping unknown ids with a warning. */
function validateDateMap(
  value: unknown,
  field: string,
  known: Set<string>,
  errors: string[],
  warnings: string[],
): Record<string, string> {
  const result: Record<string, string> = {};
  if (value === undefined) return result;
  if (!isRecord(value)) {
    errors.push(`"${field}" must be an object.`);
    return result;
  }
  let unknown = 0;
  for (const [key, date] of Object.entries(value)) {
    if (!known.has(key)) {
      unknown++;
      continue;
    }
    if (!isIsoDate(date)) {
      errors.push(`"${field}.${key}" must be a valid date.`);
      continue;
    }
    result[key] = date;
  }
  if (unknown > 0) warnings.push(`Ignored ${unknown} unknown entr${unknown === 1 ? 'y' : 'ies'} in "${field}".`);
  return result;
}

function validateSession(value: unknown, index: number, errors: string[]): StudySession | null {
  const where = `sessions[${index}]`;
  if (!isRecord(value)) {
    errors.push(`${where} must be an object.`);
    return null;
  }
  const { id, date, category, minutes, note, slotId } = value;
  if (typeof id !== 'string' || id.length === 0) errors.push(`${where}.id must be a non-empty string.`);
  if (!isValidDateKey(date)) errors.push(`${where}.date must be a YYYY-MM-DD date.`);
  if (typeof category !== 'string' || !categories.includes(category as StudyCategory))
    errors.push(`${where}.category must be one of ${categories.join(', ')}.`);
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0 || minutes > MAX_SESSION_MINUTES)
    errors.push(`${where}.minutes must be a number between 1 and ${MAX_SESSION_MINUTES}.`);
  if (note !== undefined && typeof note !== 'string') errors.push(`${where}.note must be text.`);
  if (slotId !== undefined && typeof slotId !== 'string') errors.push(`${where}.slotId must be text.`);
  if (errors.length > 0) return null;
  const session: StudySession = {
    id: id as string,
    date: date as string,
    category: category as StudyCategory,
    minutes: Math.round(minutes as number),
  };
  if (typeof note === 'string' && note.length > 0) session.note = note;
  if (typeof slotId === 'string') session.slotId = slotId;
  return session;
}

function validateCheckpoints(value: unknown, errors: string[], warnings: string[]): Record<string, CheckpointProgress> {
  const result: Record<string, CheckpointProgress> = {};
  if (value === undefined) return result;
  if (!isRecord(value)) {
    errors.push('"checkpoints" must be an object.');
    return result;
  }
  let unknown = 0;
  for (const [phaseId, raw] of Object.entries(value)) {
    const def = checkpointDefs[phaseId];
    if (!def) {
      unknown++;
      continue;
    }
    const where = `checkpoints.${phaseId}`;
    if (!isRecord(raw)) {
      errors.push(`"${where}" must be an object.`);
      continue;
    }
    const cp: CheckpointProgress = { problems: {} };
    if (raw.quiz !== undefined) {
      const q = raw.quiz;
      if (
        !isRecord(q) ||
        typeof q.bestScore !== 'number' ||
        q.bestScore < 0 ||
        q.bestScore > 100 ||
        typeof q.attempts !== 'number' ||
        !Number.isInteger(q.attempts) ||
        q.attempts < 0 ||
        (q.passedAt !== undefined && !isIsoDate(q.passedAt))
      ) {
        errors.push(`"${where}.quiz" is invalid.`);
      } else {
        cp.quiz = { bestScore: q.bestScore, attempts: q.attempts, ...(q.passedAt ? { passedAt: q.passedAt as string } : {}) };
      }
    }
    if (raw.problems !== undefined) {
      if (!isRecord(raw.problems)) errors.push(`"${where}.problems" must be an object.`);
      else {
        const known = new Set(def.problems.map((p) => p.id));
        for (const [problemId, pr] of Object.entries(raw.problems)) {
          if (!known.has(problemId)) {
            unknown++;
            continue;
          }
          if (!isRecord(pr) || typeof pr.code !== 'string' || pr.code.length > MAX_CODE_LENGTH || (pr.passedAt !== undefined && !isIsoDate(pr.passedAt))) {
            errors.push(`"${where}.problems.${problemId}" is invalid.`);
            continue;
          }
          cp.problems[problemId] = { code: pr.code, ...(pr.passedAt ? { passedAt: pr.passedAt as string } : {}) };
        }
      }
    }
    result[phaseId] = cp;
  }
  if (unknown > 0) warnings.push(`Ignored ${unknown} unknown checkpoint entr${unknown === 1 ? 'y' : 'ies'}.`);
  return result;
}

/**
 * Validates unknown data (from localStorage or an imported file) and returns a clean AppState.
 * Missing optional sections fall back to defaults; malformed sections are reported as errors.
 */
export function validateState(input: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(input)) return { ok: false, errors: ['The file does not contain a progress object.'] };

  // Accept both a raw state and the export envelope { app, exportedAt, data }.
  const raw = isRecord(input.data) && input.app === 'lyra-roadmap' ? input.data : input;
  if (!isRecord(raw)) return { ok: false, errors: ['The file does not contain a progress object.'] };

  if (raw.version !== 1) errors.push(`Unsupported version: ${String(raw.version)}. Expected 1.`);

  const state = createInitialState();
  state.completedLessons = validateDateMap(raw.completedLessons, 'completedLessons', lessonIds, errors, warnings);
  state.completedExercises = validateDateMap(raw.completedExercises, 'completedExercises', exerciseIds, errors, warnings);
  state.achievements = validateDateMap(raw.achievements, 'achievements', milestoneIds, errors, warnings);
  state.checkpoints = validateCheckpoints(raw.checkpoints, errors, warnings);

  if (raw.notes !== undefined) {
    if (!isRecord(raw.notes)) errors.push('"notes" must be an object.');
    else {
      for (const [key, text] of Object.entries(raw.notes)) {
        if (typeof text !== 'string') errors.push(`"notes.${key}" must be text.`);
        else if (lessonIds.has(key) && text.length > 0) state.notes[key] = text;
      }
    }
  }

  if (raw.weeklyGoals !== undefined) {
    if (!isRecord(raw.weeklyGoals)) errors.push('"weeklyGoals" must be an object.');
    else {
      for (const [key, text] of Object.entries(raw.weeklyGoals)) {
        if (!isValidDateKey(key)) errors.push(`"weeklyGoals" key "${key}" must be a YYYY-MM-DD date.`);
        else if (typeof text !== 'string') errors.push(`"weeklyGoals.${key}" must be text.`);
        else if (text.length > 0) state.weeklyGoals[key] = text;
      }
    }
  }

  if (raw.sessions !== undefined) {
    if (!Array.isArray(raw.sessions)) errors.push('"sessions" must be a list.');
    else {
      const seen = new Set<string>();
      raw.sessions.forEach((s, i) => {
        const sessionErrors: string[] = [];
        const session = validateSession(s, i, sessionErrors);
        errors.push(...sessionErrors.slice(0, 3));
        if (session && !seen.has(session.id)) {
          seen.add(session.id);
          state.sessions.push(session);
        }
      });
    }
  }

  if (raw.lastViewedLessonId !== undefined && raw.lastViewedLessonId !== null) {
    if (typeof raw.lastViewedLessonId === 'string' && lessonIds.has(raw.lastViewedLessonId))
      state.lastViewedLessonId = raw.lastViewedLessonId;
    else warnings.push('Ignored an unknown last-viewed lesson.');
  }

  if (raw.currentPhaseId !== undefined && raw.currentPhaseId !== null) {
    if (typeof raw.currentPhaseId === 'string' && phaseIds.has(raw.currentPhaseId)) state.currentPhaseId = raw.currentPhaseId;
    else warnings.push('Ignored an unknown current phase.');
  }

  if (raw.settings !== undefined) {
    if (!isRecord(raw.settings)) errors.push('"settings" must be an object.');
    else {
      const target = raw.settings.weeklyHoursTarget;
      if (
        typeof target !== 'number' ||
        !Number.isInteger(target) ||
        target < MIN_WEEKLY_HOURS ||
        target > MAX_WEEKLY_HOURS
      ) {
        errors.push(`"settings.weeklyHoursTarget" must be a whole number between ${MIN_WEEKLY_HOURS} and ${MAX_WEEKLY_HOURS}.`);
      } else state.settings.weeklyHoursTarget = target;
    }
  }

  if (errors.length > 0) return { ok: false, errors: errors.slice(0, 12) };
  return { ok: true, state, warnings };
}
