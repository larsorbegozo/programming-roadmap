import type { LessonExercise } from '../../types/checkpoint';
import { phase1Exercises } from './p1';

/** Lesson coding exercises. Phases are added here as they get real exercises. */
export const lessonExercises: LessonExercise[] = [...phase1Exercises];

const byLesson = new Map<string, LessonExercise[]>();
for (const exercise of lessonExercises) byLesson.set(exercise.lessonId, [...(byLesson.get(exercise.lessonId) ?? []), exercise]);

const byId = new Map(lessonExercises.map((e) => [e.id, e]));

export function getLessonExercises(lessonId: string): LessonExercise[] {
  return byLesson.get(lessonId) ?? [];
}

export function getLessonExercise(id: string): LessonExercise | undefined {
  return byId.get(id);
}

export const lessonExerciseIds = lessonExercises.map((e) => e.id);
