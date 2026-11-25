/**
 * Phase checkpoints: auto-graded questions plus coding problems that run against real tests.
 * A phase only counts as completed when all its lessons are done AND its checkpoint is passed.
 */

export type CodeLanguage = 'js' | 'ts' | 'jsx' | 'rn' | 'sql';

export interface CodeTest {
  name: string;
  /**
   * js / ts / jsx / rn: the body of an async function. It can use the problem's exported names,
   * the `setup` fixtures, `expect`, `assert` and (for jsx/rn) `render`, `h` and the other React helpers.
   * sql: a check query run after the learner's SQL; its result must match the reference solution's.
   * An empty string compares the result of the learner's own last statement.
   */
  code: string;
}

/** TypeScript-only: a snippet that must type-check. `// @ts-expect-error` lines assert that something is rejected. */
export interface TypeTest {
  name: string;
  code: string;
  /** Shown when the learner's types are too loose (an @ts-expect-error line is unused). */
  hint?: string;
}

export interface CodeProblem {
  id: string;
  title: string;
  /** Lesson number inside the phase this problem practises. */
  lesson?: number;
  /** Lightweight markdown: paragraphs, `inline code`, ``` fences and "- " bullet lines. */
  prompt: string;
  language: CodeLanguage;
  starter: string;
  /** Reference solution. Shown only after the problem is passed. */
  solution: string;
  /** Names the learner must define (js / ts / jsx / rn). */
  exports?: string[];
  /** js-family: fixture code run before every test. sql: schema and seed data. */
  setup?: string;
  tests: CodeTest[];
  typeTests?: TypeTest[];
  hints?: string[];
  /** sql: whether row order matters when comparing results. */
  ordered?: boolean;
}

interface QuestionBase {
  id: string;
  lesson?: number;
  prompt: string;
  explanation: string;
}

export interface SingleChoiceQuestion extends QuestionBase {
  kind: 'single';
  options: string[];
  answer: number;
}

export interface MultiChoiceQuestion extends QuestionBase {
  kind: 'multi';
  options: string[];
  answers: number[];
}

export interface TextQuestion extends QuestionBase {
  kind: 'text';
  /** Accepted answers. Compared ignoring case, whitespace and surrounding quotes. */
  accept: string[];
  placeholder?: string;
}

export type Question = SingleChoiceQuestion | MultiChoiceQuestion | TextQuestion;

export interface Checkpoint {
  phaseId: string;
  questions: Question[];
  problems: CodeProblem[];
}

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export interface RunReport {
  passed: boolean;
  results: TestResult[];
  logs: string[];
  /** A problem that stopped the code from running at all. */
  error?: string;
  /** sql: the learner's last result set, for display. */
  table?: { columns: string[]; rows: unknown[][] };
}
