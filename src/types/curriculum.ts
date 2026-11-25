export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export type ResourceType = 'documentation' | 'interactive-course' | 'tutorial' | 'reference' | 'tool';

export interface Resource {
  id: string;
  name: string;
  description: string;
  url: string;
  type: ResourceType;
  topics: string[];
  phaseId: string;
}

export interface Exercise {
  id: string;
  title: string;
}

export interface Lesson {
  id: string;
  phaseId: string;
  /** 1-based position inside its phase. */
  number: number;
  title: string;
  description: string;
  objectives: string[];
  resourceIds: string[];
  exercises: Exercise[];
  difficulty: Difficulty;
  estimatedMinutes: number;
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  /** Human-readable duration, as written in the roadmap. */
  duration: string;
  /** Planning estimate in weeks, assuming ~10 study hours per week. */
  estimatedWeeks: number;
  ongoing: boolean;
  description: string;
  objectives: string[];
  /** Label for the phase-level practice list ("Practical exercises" / "Practical projects"). */
  practiceLabel: string;
  lessons: Lesson[];
  resourceIds: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
}
