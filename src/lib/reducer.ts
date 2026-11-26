import { getLesson } from '../data/curriculum';
import type { ActiveExam, AppState, CheckpointProgress, ExamAnswer, ExamAttempt, ExamPlan, Settings, StudySession } from '../types/state';
import { createInitialState } from './validation';

export type Action =
  | { type: 'toggleLesson'; lessonId: string }
  | { type: 'toggleExercise'; exerciseId: string }
  | { type: 'setNote'; lessonId: string; text: string }
  | { type: 'viewLesson'; lessonId: string }
  | { type: 'addSession'; session: StudySession }
  | { type: 'updateSession'; session: StudySession }
  | { type: 'removeSession'; sessionId: string }
  | { type: 'setWeeklyGoal'; weekKey: string; text: string }
  | { type: 'updateSettings'; settings: Partial<Settings> }
  | { type: 'setAchievements'; achievements: Record<string, string> }
  | { type: 'saveProblemCode'; phaseId: string; problemId: string; code: string }
  | { type: 'markProblemPassed'; phaseId: string; problemId: string; code: string }
  | { type: 'recordQuiz'; phaseId: string; score: number; passed: boolean }
  | { type: 'setExamPlan'; plan: ExamPlan | null }
  | { type: 'startExam'; exam: ActiveExam }
  | { type: 'updateExamAnswer'; questionId: string; answer: ExamAnswer | null }
  | { type: 'updateExamCode'; problemId: string; code: string }
  | { type: 'finishExam'; phaseId: string; attempt: ExamAttempt }
  | { type: 'replaceState'; state: AppState }
  | { type: 'reset' };

function toggleKey(map: Record<string, string>, key: string): Record<string, string> {
  const next = { ...map };
  if (next[key]) delete next[key];
  else next[key] = new Date().toISOString();
  return next;
}

function withCheckpoint(state: AppState, phaseId: string, update: (cp: CheckpointProgress) => CheckpointProgress): AppState {
  const current = state.checkpoints[phaseId] ?? { problems: {} };
  return { ...state, checkpoints: { ...state.checkpoints, [phaseId]: update(current) } };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'toggleLesson':
      return { ...state, completedLessons: toggleKey(state.completedLessons, action.lessonId) };
    case 'toggleExercise':
      return { ...state, completedExercises: toggleKey(state.completedExercises, action.exerciseId) };
    case 'setNote': {
      const notes = { ...state.notes };
      if (action.text.trim().length === 0) delete notes[action.lessonId];
      else notes[action.lessonId] = action.text;
      return { ...state, notes };
    }
    case 'viewLesson': {
      const lesson = getLesson(action.lessonId);
      if (!lesson || state.lastViewedLessonId === lesson.id) return state;
      return { ...state, lastViewedLessonId: lesson.id, currentPhaseId: lesson.phaseId };
    }
    case 'addSession':
      return { ...state, sessions: [...state.sessions, action.session] };
    case 'updateSession':
      return { ...state, sessions: state.sessions.map((s) => (s.id === action.session.id ? action.session : s)) };
    case 'removeSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.sessionId) };
    case 'setWeeklyGoal': {
      const weeklyGoals = { ...state.weeklyGoals };
      if (action.text.trim().length === 0) delete weeklyGoals[action.weekKey];
      else weeklyGoals[action.weekKey] = action.text.trim();
      return { ...state, weeklyGoals };
    }
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'setAchievements':
      return { ...state, achievements: action.achievements };
    case 'saveProblemCode':
      return withCheckpoint(state, action.phaseId, (cp) => ({
        ...cp,
        problems: { ...cp.problems, [action.problemId]: { ...cp.problems[action.problemId], code: action.code } },
      }));
    case 'markProblemPassed':
      return withCheckpoint(state, action.phaseId, (cp) => {
        const prev = cp.problems[action.problemId];
        return {
          ...cp,
          problems: { ...cp.problems, [action.problemId]: { code: action.code, passedAt: prev?.passedAt ?? new Date().toISOString() } },
        };
      });
    case 'recordQuiz':
      return withCheckpoint(state, action.phaseId, (cp) => {
        const prev = cp.quiz;
        return {
          ...cp,
          quiz: {
            bestScore: Math.max(prev?.bestScore ?? 0, action.score),
            attempts: (prev?.attempts ?? 0) + 1,
            passedAt: prev?.passedAt ?? (action.passed ? new Date().toISOString() : undefined),
          },
        };
      });
    case 'setExamPlan':
      return { ...state, examPlan: action.plan };
    case 'startExam':
      return state.activeExam ? state : { ...state, activeExam: action.exam };
    case 'updateExamAnswer': {
      if (!state.activeExam) return state;
      const answers = { ...state.activeExam.answers };
      if (action.answer === null) delete answers[action.questionId];
      else answers[action.questionId] = action.answer;
      return { ...state, activeExam: { ...state.activeExam, answers } };
    }
    case 'updateExamCode':
      if (!state.activeExam) return state;
      return { ...state, activeExam: { ...state.activeExam, code: { ...state.activeExam.code, [action.problemId]: action.code } } };
    case 'finishExam': {
      if (state.activeExam?.phaseId !== action.phaseId) return state;
      const attempts = [...(state.examAttempts[action.phaseId] ?? []), action.attempt];
      return { ...state, activeExam: null, examAttempts: { ...state.examAttempts, [action.phaseId]: attempts } };
    }
    case 'replaceState':
      return action.state;
    case 'reset':
      return createInitialState();
  }
}
