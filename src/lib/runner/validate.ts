/**
 * Content checks for every question and coding problem. They run in `npm test`
 * (src/lib/runner/content.test.ts) and, in development, as window.__lyraValidate() in the browser.
 * Every reference solution must pass all of its tests, and every starter must fail at least one.
 */
import { checkpoints } from '../../data/checkpoints';
import { curriculum } from '../../data/curriculum';
import { getLessonExercises } from '../../data/exercises';
import { finals } from '../../data/finals';
import type { CodeProblem, Question, RunReport } from '../../types/checkpoint';
import type { Phase } from '../../types/curriculum';
import { runProblem } from './index';

export interface ValidationIssue {
  where: string;
  problem: string;
}

export interface ProblemEntry {
  where: string;
  phase: Phase;
  problem: CodeProblem;
  /** Final exams need visible example tests and hidden ones. */
  exam: boolean;
}

export interface QuestionGroup {
  where: string;
  phase: Phase;
  questions: Question[];
}

/** Every problem and question in the curriculum, labelled by where it lives. */
export function collectContent(filter?: string) {
  const problems: ProblemEntry[] = [];
  const questions: QuestionGroup[] = [];
  const issues: ValidationIssue[] = [];
  for (const phase of curriculum) {
    if (filter && phase.id !== filter && `final-${phase.id}` !== filter) continue;
    const cp = checkpoints[phase.id];
    const final = finals[phase.id];
    if (!cp) issues.push({ where: phase.id, problem: 'No checkpoint defined' });
    if (!final) issues.push({ where: phase.id, problem: 'No final exam defined' });
    if (filter !== `final-${phase.id}`) {
      for (const lesson of phase.lessons) {
        const exercises = getLessonExercises(lesson.id);
        if (exercises.length && !exercises.some((e) => e.level === 'core')) issues.push({ where: lesson.id, problem: 'No core exercise' });
        for (const problem of exercises) problems.push({ where: `${lesson.id}/${problem.id}`, phase, problem, exam: false });
      }
      if (cp) {
        questions.push({ where: phase.id, phase, questions: cp.questions });
        for (const problem of cp.problems) problems.push({ where: `${phase.id}/${problem.id}`, phase, problem, exam: false });
      }
    }
    if (final && filter !== phase.id) {
      const where = `final-${phase.id}`;
      questions.push({ where, phase, questions: final.questions });
      const all = final.project ? [...final.problems, final.project.problem] : final.problems;
      for (const problem of all) problems.push({ where: `${where}/${problem.id}`, phase, problem, exam: true });
      if (final.questions.length + final.problems.length === 0) issues.push({ where, problem: 'Empty exam' });
    }
  }
  return { problems, questions, issues };
}

export function checkQuestions({ where: label, phase, questions }: QuestionGroup): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const q of questions) {
    const where = `${label}/${q.id}`;
    if (q.lesson && !phase.lessons[q.lesson - 1]) issues.push({ where, problem: `Lesson ${q.lesson} does not exist` });
    if (q.kind === 'single' && !(q.answer >= 0 && q.answer < q.options.length)) issues.push({ where, problem: 'Answer index out of range' });
    if (q.kind === 'multi' && (q.answers.length === 0 || q.answers.some((a) => a < 0 || a >= q.options.length)))
      issues.push({ where, problem: 'Multi answers invalid' });
    if (q.kind === 'text' && q.accept.length === 0) issues.push({ where, problem: 'No accepted answers' });
    if ((q.kind === 'single' || q.kind === 'multi') && new Set(q.options).size !== q.options.length) issues.push({ where, problem: 'Duplicate options' });
  }
  return issues;
}

/** Checks that do not need to run any code. */
export function checkProblemShape({ where, phase, problem: p, exam }: ProblemEntry): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (p.lesson && !phase.lessons[p.lesson - 1]) issues.push({ where, problem: `Lesson ${p.lesson} does not exist` });
  if (exam) {
    const all = [...p.tests, ...(p.typeTests ?? [])];
    if (!p.tests.some((t) => !t.hidden)) issues.push({ where, problem: 'No visible runtime example test' });
    if (!all.some((t) => t.hidden)) issues.push({ where, problem: 'No hidden test' });
  }
  const reserved = (p.exports ?? []).filter((n) => ['ref', 'rand', 'sameAsRef', 'expect', 'assert'].includes(n));
  if (reserved.length) issues.push({ where, problem: `Export names clash with test helpers: ${reserved.join(', ')}` });
  return issues;
}

export function duplicateIds(problems: ProblemEntry[], questions: QuestionGroup[]): ValidationIssue[] {
  const seen = new Set<string>();
  const issues: ValidationIssue[] = [];
  const ids = [...problems.map((e) => ({ where: e.where, id: e.problem.id })), ...questions.flatMap((g) => g.questions.map((q) => ({ where: `${g.where}/${q.id}`, id: q.id })))];
  for (const { where, id } of ids) {
    if (seen.has(id)) issues.push({ where, problem: 'Duplicate id' });
    seen.add(id);
  }
  return issues;
}

export function failures(report: RunReport): string {
  const failed = report.results.filter((r) => !r.passed).map((r) => `${r.name}: ${r.message}`);
  return `${report.error ?? ''} ${failed.join(' | ')}`.trim();
}

export async function validateAll(filter?: string): Promise<{ issues: ValidationIssue[]; checked: number }> {
  const { problems, questions, issues } = collectContent(filter);
  issues.push(...duplicateIds(problems, questions), ...questions.flatMap(checkQuestions));
  for (const entry of problems) {
    issues.push(...checkProblemShape(entry));
    const good = await runProblem(entry.problem, entry.problem.solution);
    if (!good.passed) issues.push({ where: entry.where, problem: `Solution fails: ${failures(good)}` });
    const bad = await runProblem(entry.problem, entry.problem.starter);
    if (bad.passed) issues.push({ where: entry.where, problem: 'Starter code already passes' });
  }
  return { issues, checked: problems.length };
}
