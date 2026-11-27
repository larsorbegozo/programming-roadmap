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

/** The exam calendar, generated once and only changed when the learner re-plans it. */
export interface ExamPlan {
  createdAt: string;
  startDate: string;
  hoursPerWeek: number;
  breakStart?: string;
  breakEnd?: string;
  /** phaseId -> study window and the deadline of the first sitting ("mesa"). */
  units: Record<string, { start: string; deadline: string }>;
}

export type ExamAnswer = number | number[] | string;

export interface ExamAttempt {
  /** 0 = first sitting, 1 = retake, 2+ = "libre" sittings. */
  sitting: number;
  startedAt: string;
  submittedAt: string;
  /** 0–100 */
  percent: number;
  /** 1–10, passing grade 4. */
  grade: number;
  passed: boolean;
  questionResults: Record<string, boolean>;
  /** problemId -> fraction of tests passed, 0–1. */
  problemScores: Record<string, number>;
  /** Two-stage exams: the score of each stage, 0–100 (projectPercent is absent if the questions failed). */
  questionPercent?: number;
  projectPercent?: number;
}

/** The exam currently being taken; persisted so the clock survives a reload. */
export interface ActiveExam {
  phaseId: string;
  sitting: number;
  startedAt: string;
  answers: Record<string, ExamAnswer>;
  code: Record<string, string>;
  orders: Record<string, number[]>;
  /** Two-stage exams: 'project-ready' after the questions passed, 'project' once the project clock started. */
  stage?: 'questions' | 'project-ready' | 'project';
  questionPercent?: number;
  questionResults?: Record<string, boolean>;
  problemScores?: Record<string, number>;
  /** In 'project-ready' this is when the break ends and the project clock starts by itself. */
  projectStartedAt?: string;
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
  /** Lesson coding exercises: exerciseId -> latest code and when it first passed. */
  lessonExercises: Record<string, ProblemProgress>;
  examPlan: ExamPlan | null;
  /** phaseId -> every submitted final exam attempt. */
  examAttempts: Record<string, ExamAttempt[]>;
  activeExam: ActiveExam | null;
  settings: Settings;
}
