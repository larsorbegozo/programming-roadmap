/**
 * Development-only content check, exposed as window.__lyraValidate().
 * Every reference solution must pass all of its tests, and every starter must fail at least one.
 */
import { checkpoints } from '../../data/checkpoints';
import { curriculum } from '../../data/curriculum';
import { runProblem } from './index';

export interface ValidationIssue {
  where: string;
  problem: string;
}

export async function validateAll(filter?: string): Promise<{ issues: ValidationIssue[]; checked: number }> {
  const issues: ValidationIssue[] = [];
  let checked = 0;
  const ids = new Set<string>();

  for (const phase of curriculum) {
    if (filter && phase.id !== filter) continue;
    const cp = checkpoints[phase.id];
    if (!cp) {
      issues.push({ where: phase.id, problem: 'No checkpoint defined' });
      continue;
    }
    for (const q of cp.questions) {
      const where = `${phase.id}/${q.id}`;
      if (ids.has(q.id)) issues.push({ where, problem: 'Duplicate id' });
      ids.add(q.id);
      if (q.lesson && !phase.lessons[q.lesson - 1]) issues.push({ where, problem: `Lesson ${q.lesson} does not exist` });
      if (q.kind === 'single' && !(q.answer >= 0 && q.answer < q.options.length)) issues.push({ where, problem: 'Answer index out of range' });
      if (q.kind === 'multi' && (q.answers.length === 0 || q.answers.some((a) => a < 0 || a >= q.options.length)))
        issues.push({ where, problem: 'Multi answers invalid' });
      if (q.kind === 'text' && q.accept.length === 0) issues.push({ where, problem: 'No accepted answers' });
      if ((q.kind === 'single' || q.kind === 'multi') && new Set(q.options).size !== q.options.length) issues.push({ where, problem: 'Duplicate options' });
    }
    for (const p of cp.problems) {
      const where = `${phase.id}/${p.id}`;
      if (ids.has(p.id)) issues.push({ where, problem: 'Duplicate id' });
      ids.add(p.id);
      if (p.lesson && !phase.lessons[p.lesson - 1]) issues.push({ where, problem: `Lesson ${p.lesson} does not exist` });
      checked++;
      const good = await runProblem(p, p.solution);
      if (!good.passed) {
        const failed = good.results.filter((r) => !r.passed).map((r) => `${r.name}: ${r.message}`);
        issues.push({ where, problem: `Solution fails: ${good.error ?? ''} ${failed.join(' | ')}` });
      }
      const bad = await runProblem(p, p.starter);
      if (bad.passed) issues.push({ where, problem: 'Starter code already passes' });
    }
  }
  return { issues, checked };
}
