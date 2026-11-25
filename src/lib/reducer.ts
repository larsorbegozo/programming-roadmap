import { getLesson } from '../data/curriculum';
import type { AppState, Settings, StudySession } from '../types/state';
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
  | { type: 'replaceState'; state: AppState }
  | { type: 'reset' };

function toggleKey(map: Record<string, string>, key: string): Record<string, string> {
  const next = { ...map };
  if (next[key]) delete next[key];
  else next[key] = new Date().toISOString();
  return next;
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
    case 'replaceState':
      return action.state;
    case 'reset':
      return createInitialState();
  }
}
