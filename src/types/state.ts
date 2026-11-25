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

export interface ProblemProgress {
  /** The learner's latest code. */
  code: string;
  /** Set the first time every test passed. */
  passedAt?: string;
}

export interface QuizProgress {
  /** Best score so far, 0–100. */
  bestScore: number;
  attempts: number;
  /** Set the first time the score reached the pass mark. */
  passedAt?: string;
}

export interface CheckpointProgress {
  quiz?: QuizProgress;
  problems: Record<string, ProblemProgress>;
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
  /** phaseId -> checkpoint progress. */
  checkpoints: Record<string, CheckpointProgress>;
  settings: Settings;
}
