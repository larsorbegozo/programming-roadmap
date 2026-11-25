import type { StudyCategory } from '../../types/state';

export const CATEGORIES: StudyCategory[] = ['theory', 'practice', 'revision'];

export const CATEGORY_COLOR: Record<StudyCategory, string> = {
  theory: 'var(--color-theory)',
  practice: 'var(--color-practice)',
  revision: 'var(--color-revision)',
};
