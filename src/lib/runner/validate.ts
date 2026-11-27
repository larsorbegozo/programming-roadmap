/**
 * Development-only content check, exposed as window.__lyraValidate().
 * Every reference solution must pass all of its tests, and every starter must fail at least one.
 */
import { checkpoints } from '../../data/checkpoints';
import { curriculum } from '../../data/curriculum';
import { getLessonExercises } from '../../data/exercises';
import { finals } from '../../data/finals';
import type { CodeProblem, Question } from '../../types/checkpoint';
import type { Phase } from '../../types/curriculum';
import { runProblem } from './index';

export interface ValidationIssue {
  where: string;
  problem: string;
}

function checkQuestions(phase: Phase, questions: Question[], ids: Set<string>, issues: ValidationIssue[], label: string) {
  for (const q of questions) {
    const where = `${label}/${q.id}`;
    if (ids.has(q.id)) issues.push({ where, problem: 'Duplicate id' });
    ids.add(q.id);
    if (q.lesson && !phase.lessons[q.lesson - 1]) issues.push({ where, problem: `Lesson ${q.lesson} does not exist` });
    if (q.kind === 'single' && !(q.answer >= 0 && q.answer < q.options.length)) issues.push({ where, problem: 'Answer index out of range' });
    if (q.kind === 'multi' && (q.answers.length === 0 || q.answers.some((a) => a < 0 || a >= q.options.length)))
      issues.push({ where, problem: 'Multi answers invalid' });
    if (q.kind === 'text' && q.accept.length === 0) issues.push({ where, problem: 'No accepted answers' });
    if ((q.kind === 'single' || q.kind === 'multi') && new Set(q.options).size !== q.options.length) issues.push({ where, problem: 'Duplicate options' });
  }
}

async function checkProblems(phase: Phase, problems: CodeProblem[], ids: Set<string>, issues: ValidationIssue[], label: string, exam: boolean) {
  for (const p of problems) {
    const where = `${label}/${p.id}`;
    if (ids.has(p.id)) issues.push({ where, problem: 'Duplicate id' });
    ids.add(p.id);
    if (p.lesson && !phase.lessons[p.lesson - 1]) issues.push({ where, problem: `Lesson ${p.lesson} does not exist` });
    if (exam) {
      const all = [...p.tests, ...(p.typeTests ?? [])];
      if (!p.tests.some((t) => !t.hidden)) issues.push({ where, problem: 'No visible runtime example test' });
      if (!all.some((t) => t.hidden)) issues.push({ where, problem: 'No hidden test' });
    }
    const good = await runProblem(p, p.solution);
    if (!good.passed) {
      const failed = good.results.filter((r) => !r.passed).map((r) => `${r.name}: ${r.message}`);
      issues.push({ where, problem: `Solution fails: ${good.error ?? ''} ${failed.join(' | ')}` });
    }
    const bad = await runProblem(p, p.starter);
    if (bad.passed) issues.push({ where, problem: 'Starter code already passes' });
  }
}

export async function validateAll(filter?: string): Promise<{ issues: ValidationIssue[]; checked: number }> {
  const issues: ValidationIssue[] = [];
  let checked = 0;
  const ids = new Set<string>();

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
        await checkProblems(phase, exercises, ids, issues, lesson.id, false);
        checked += exercises.length;
      }
    }
    if (cp && filter !== `final-${phase.id}`) {
      checkQuestions(phase, cp.questions, ids, issues, phase.id);
      await checkProblems(phase, cp.problems, ids, issues, phase.id, false);
      checked += cp.problems.length;
    }
    if (final && filter !== phase.id) {
      checkQuestions(phase, final.questions, ids, issues, `final-${phase.id}`);
      await checkProblems(phase, final.problems, ids, issues, `final-${phase.id}`, true);
      checked += final.problems.length;
      if (final.project) {
        await checkProblems(phase, [final.project.problem], ids, issues, `final-${phase.id}`, true);
        checked += 1;
      }
      if (final.questions.length + final.problems.length === 0) issues.push({ where: `final-${phase.id}`, problem: 'Empty exam' });
    }
  }
  return { issues, checked };
}
