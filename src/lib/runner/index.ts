import type { CodeProblem, RunReport, TestResult } from '../../types/checkpoint';
import type { EngineRequest, WorkerReply, WorkerResponse } from './protocol';
import { stripModuleSyntax, transpile, typeCheck } from './typescript';

const JS_TIMEOUT_MS = 6000;
const SQL_TIMEOUT_MS = 15000;

function randomNonce(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function runInWorker(request: EngineRequest, timeoutMs: number): Promise<WorkerResponse> {
  const nonce = randomNonce();
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({
        results: request.tests.map((t) => ({ name: t.name, passed: false, message: 'Stopped: your code took too long. Check for an infinite loop.' })),
        logs: [],
        error: 'Your code took too long and was stopped. Check for an infinite loop.',
      });
    }, timeoutMs);
    worker.onmessage = (event: MessageEvent<WorkerReply>) => {
      // Anything without the nonce was posted by learner code, not by the engine.
      if (event.data?.nonce !== nonce) return;
      clearTimeout(timer);
      worker.terminate();
      resolve(event.data.response);
    };
    worker.onerror = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ results: [], logs: [], error: `The code runner failed to start: ${event.message || 'unknown error'}` });
    };
    worker.postMessage({ nonce, request });
  });
}

function report(results: TestResult[], response: Partial<WorkerResponse> = {}): RunReport {
  return {
    passed: results.length > 0 && results.every((r) => r.passed) && !response.error,
    results,
    logs: response.logs ?? [],
    error: response.error,
    table: response.table,
  };
}

/** Plain JavaScript runs as written; TypeScript, JSX and React Native are transpiled first. */
async function toJs(problem: CodeProblem, source: string): Promise<{ code: string; errors: string[] }> {
  if (problem.language === 'js') return { code: source, errors: [] };
  return transpile(source, problem.language === 'jsx' || problem.language === 'rn');
}

export interface RunOptions {
  /** Final exams: false runs only the example (visible) tests. Defaults to true. */
  includeHidden?: boolean;
}

/** Runs a prepared request: in a Web Worker in the app, directly through the engine in `npm test`. */
export type Executor = (request: EngineRequest, timeoutMs: number) => Promise<WorkerResponse>;

/** Run the learner's code for a problem against its tests. */
export function runProblem(problem: CodeProblem, code: string, options: RunOptions = {}): Promise<RunReport> {
  return runProblemWith(runInWorker, problem, code, options);
}

export async function runProblemWith(execute: Executor, fullProblem: CodeProblem, code: string, options: RunOptions = {}): Promise<RunReport> {
  const includeHidden = options.includeHidden ?? true;
  const problem: CodeProblem = includeHidden
    ? fullProblem
    : {
        ...fullProblem,
        tests: fullProblem.tests.filter((t) => !t.hidden),
        typeTests: fullProblem.typeTests?.filter((t) => !t.hidden),
      };
  try {
    if (problem.language === 'sql') {
      const response = await execute(
        { kind: 'sql', setup: problem.setup ?? '', user: code, reference: problem.solution, tests: problem.tests, ordered: Boolean(problem.ordered) },
        SQL_TIMEOUT_MS,
      );
      return report(response.results, response);
    }

    const source = stripModuleSyntax(code);
    const preResults: TestResult[] = [];

    if (problem.language === 'ts') {
      const checked = await typeCheck(source, problem.typeTests ?? []);
      preResults.push(...checked.results);
    }
    const out = await toJs(problem, source);
    if (out.errors.length > 0) {
      const message = `Syntax error:\n${out.errors.slice(0, 5).join('\n')}`;
      return report([...preResults, ...problem.tests.map((t) => ({ name: t.name, passed: false, message }))], { error: message });
    }

    if (problem.tests.length === 0) return report(preResults);

    const reference = await toJs(problem, stripModuleSyntax(problem.solution));
    if (reference.errors.length > 0) throw new Error(`the reference solution does not compile: ${reference.errors[0]}`);

    const response = await execute(
      {
        kind: 'js',
        mode: problem.language === 'jsx' ? 'react' : problem.language === 'rn' ? 'rn' : 'plain',
        code: out.code,
        reference: reference.code,
        exports: problem.exports ?? [],
        setup: problem.setup ?? '',
        tests: problem.tests,
        seed: crypto.getRandomValues(new Uint32Array(1))[0] as number,
      },
      JS_TIMEOUT_MS,
    );
    return report([...preResults, ...response.results], response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return report([], { error: `Could not run the tests: ${message}` });
  }
}
