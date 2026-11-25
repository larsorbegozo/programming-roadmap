export type StudyCategory = 'theory' | 'practice' | 'revision';

export interface StudySession {
  id: string;
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  category: StudyCategory;
  minutes: number;
  note?: string;
  /** Set when the session fulfils a planned slot in the weekly plan. */
  slotId?: string;
}

export interface Settings {
  weeklyHoursTarget: number;
}

export interface AppState {
  version: 1;
  /** lessonId -> ISO timestamp of completion. */
  completedLessons: Record<string, string>;
  /** exerciseId -> ISO timestamp of completion. */
  completedExercises: Record<string, string>;
  /** lessonId -> personal notes. */
  notes: Record<string, string>;
  sessions: StudySession[];
  /** weekKey (YYYY-MM-DD of Monday) -> objective text. */
  weeklyGoals: Record<string, string>;
  lastViewedLessonId: string | null;
  currentPhaseId: string | null;
  /** milestoneId -> ISO timestamp when first reached. */
  achievements: Record<string, string>;
  settings: Settings;
}
