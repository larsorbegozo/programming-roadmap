import type { Question } from '../types/checkpoint';

export type QuizAnswer = number | number[] | string | undefined;

/** Lenient comparison for typed answers: ignores case, whitespace, quote style and a trailing semicolon. */
export function normalizeText(value: string): string {
  let t = value
    .trim()
    .toLowerCase()
    .replace(/[‘’'`“”]/g, '"')
    .replace(/\s+/g, '')
    .replace(/;+$/, '');
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"') && t.indexOf('"', 1) === t.length - 1) t = t.slice(1, -1);
  return t;
}

export function isAnswered(question: Question, answer: QuizAnswer): boolean {
  if (question.kind === 'single') return typeof answer === 'number';
  if (question.kind === 'multi') return Array.isArray(answer) && answer.length > 0;
  return typeof answer === 'string' && answer.trim().length > 0;
}

export function isCorrect(question: Question, answer: QuizAnswer): boolean {
  if (question.kind === 'single') return answer === question.answer;
  if (question.kind === 'multi') {
    if (!Array.isArray(answer)) return false;
    const chosen = [...new Set(answer)].sort((a, b) => a - b);
    const expected = [...question.answers].sort((a, b) => a - b);
    return chosen.length === expected.length && chosen.every((v, i) => v === expected[i]);
  }
  if (typeof answer !== 'string') return false;
  const given = normalizeText(answer);
  return question.accept.some((a) => normalizeText(a) === given);
}

export function shuffledIndexes(length: number): number[] {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j] as number, order[i] as number];
  }
  return order;
}
