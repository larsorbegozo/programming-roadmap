import { runProblem } from '../../lib/runner';
import { PASS_PERCENT, PROBLEM_POINTS, gradeFromPercent } from '../../lib/exams';
import { isCorrect } from '../../lib/quiz';
import type { FinalExam } from '../../types/checkpoint';
import type { ActiveExam, ExamAttempt } from '../../types/state';

/** Grades a finished exam: 1 point per question, PROBLEM_POINTS per problem (partial credit per test). */
export async function gradeExam(final: FinalExam, active: ActiveExam): Promise<ExamAttempt> {
  const questionResults: Record<string, boolean> = {};
  let points = 0;
  for (const q of final.questions) {
    const ok = isCorrect(q, active.answers[q.id]);
    questionResults[q.id] = ok;
    if (ok) points += 1;
  }
  const problemScores: Record<string, number> = {};
  for (const p of final.problems) {
    const code = active.code[p.id] ?? p.starter;
    const report = await runProblem(p, code, { includeHidden: true });
    const total = report.results.length;
    // Partial credit only counts for real work: the starter must have changed and at least
    // one example test must pass. Otherwise trivial tests ("does not modify the input")
    // would give points to an empty function.
    const unchanged = code.replace(/\s+/g, '') === p.starter.replace(/\s+/g, '');
    const examples = new Set(p.tests.filter((t) => !t.hidden).map((t) => t.name));
    const exampleWorks = report.results.some((r) => r.passed && examples.has(r.name));
    const score = total === 0 || unchanged || !exampleWorks ? 0 : report.results.filter((r) => r.passed).length / total;
    problemScores[p.id] = Math.round(score * 1000) / 1000;
    points += score * PROBLEM_POINTS;
  }
  const max = final.questions.length + final.problems.length * PROBLEM_POINTS;
  const percent = max === 0 ? 0 : Math.round((points / max) * 100);
  return {
    sitting: active.sitting,
    startedAt: active.startedAt,
    submittedAt: new Date().toISOString(),
    percent,
    grade: gradeFromPercent(percent),
    passed: percent >= PASS_PERCENT,
    questionResults,
    problemScores,
  };
}
