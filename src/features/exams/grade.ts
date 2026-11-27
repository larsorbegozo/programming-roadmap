import { runProblem } from '../../lib/runner';
import { PASS_PERCENT, PROBLEM_POINTS, gradeFromPercent } from '../../lib/exams';
import { isCorrect } from '../../lib/quiz';
import type { CodeProblem, FinalExam } from '../../types/checkpoint';
import type { ActiveExam, ExamAttempt } from '../../types/state';

/** Share of the combined grade that comes from the project in two-stage exams. */
export const PROJECT_WEIGHT = 0.6;
/** Minutes between passing the questions and the project clock starting by itself. */
export const PROJECT_BREAK_MINUTES = 10;

/**
 * Score of one problem, 0–1, with every test including hidden ones. Partial credit only counts
 * for real work: the starter must have changed and at least one example test must pass.
 * Otherwise trivial tests ("does not modify the input") would give points to an empty function.
 */
export async function scoreProblem(p: CodeProblem, code: string): Promise<number> {
  const report = await runProblem(p, code, { includeHidden: true });
  const total = report.results.length;
  const unchanged = code.replace(/\s+/g, '') === p.starter.replace(/\s+/g, '');
  const examples = new Set(p.tests.filter((t) => !t.hidden).map((t) => t.name));
  const exampleWorks = report.results.some((r) => r.passed && examples.has(r.name));
  const score = total === 0 || unchanged || !exampleWorks ? 0 : report.results.filter((r) => r.passed).length / total;
  return Math.round(score * 1000) / 1000;
}

export interface StageOneResult {
  percent: number;
  questionResults: Record<string, boolean>;
  problemScores: Record<string, number>;
}

/** Questions (1 point each) and coding problems (PROBLEM_POINTS each). */
export async function gradeStageOne(final: FinalExam, active: ActiveExam): Promise<StageOneResult> {
  const questionResults: Record<string, boolean> = {};
  let points = 0;
  for (const q of final.questions) {
    const ok = isCorrect(q, active.answers[q.id]);
    questionResults[q.id] = ok;
    if (ok) points += 1;
  }
  const problemScores: Record<string, number> = {};
  for (const p of final.problems) {
    const score = await scoreProblem(p, active.code[p.id] ?? p.starter);
    problemScores[p.id] = score;
    points += score * PROBLEM_POINTS;
  }
  const max = final.questions.length + final.problems.length * PROBLEM_POINTS;
  return { percent: max === 0 ? 0 : Math.round((points / max) * 100), questionResults, problemScores };
}

function attemptFrom(active: ActiveExam, percent: number, passed: boolean, stage: StageOneResult, extra: Partial<ExamAttempt> = {}): ExamAttempt {
  return {
    sitting: active.sitting,
    startedAt: active.startedAt,
    submittedAt: new Date().toISOString(),
    percent,
    grade: gradeFromPercent(percent),
    passed,
    questionResults: stage.questionResults,
    problemScores: stage.problemScores,
    ...extra,
  };
}

/** Grades a single-stage exam. */
export async function gradeExam(final: FinalExam, active: ActiveExam): Promise<ExamAttempt> {
  const stage = await gradeStageOne(final, active);
  return attemptFrom(active, stage.percent, stage.percent >= PASS_PERCENT, stage);
}

/** A two-stage exam that ended at the questions: the project is never unlocked. */
export function failedAtQuestions(active: ActiveExam, stage: StageOneResult): ExamAttempt {
  return attemptFrom(active, stage.percent, false, stage, { questionPercent: stage.percent });
}

/**
 * Combines both stages. Both must reach PASS_PERCENT; if one does not, the grade is capped at 3
 * even when the weighted average would be higher.
 */
export function combineStages(questionPercent: number, projectPercent: number): { percent: number; passed: boolean } {
  const weighted = Math.round(questionPercent * (1 - PROJECT_WEIGHT) + projectPercent * PROJECT_WEIGHT);
  const passed = questionPercent >= PASS_PERCENT && projectPercent >= PASS_PERCENT;
  return { percent: passed ? weighted : Math.min(weighted, PASS_PERCENT - 1), passed };
}

/** Grades the project and closes a two-stage exam. */
export async function gradeProject(final: FinalExam, active: ActiveExam): Promise<ExamAttempt> {
  const project = final.project!.problem;
  const projectScore = await scoreProblem(project, active.code[project.id] ?? project.starter);
  const projectPercent = Math.round(projectScore * 100);
  const questionPercent = active.questionPercent ?? 0;
  const { percent, passed } = combineStages(questionPercent, projectPercent);
  return attemptFrom(
    active,
    percent,
    passed,
    { percent: questionPercent, questionResults: active.questionResults ?? {}, problemScores: { ...(active.problemScores ?? {}), [project.id]: projectScore } },
    { questionPercent, projectPercent },
  );
}
