import type { CodeProblem, RunReport, TestResult } from '../../types/checkpoint';
import type { WorkerRequest, WorkerResponse } from './protocol';
import { stripModuleSyntax, transpile, typeCheck } from './typescript';

const JS_TIMEOUT_MS = 6000;
const SQL_TIMEOUT_MS = 15000;

function runInWorker(request: WorkerRequest, timeoutMs: number): Promise<WorkerResponse> {
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
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ results: [], logs: [], error: `The code runner failed to start: ${event.message || 'unknown error'}` });
    };
    worker.postMessage(request);
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

export interface RunOptions {
  /** Final exams: false runs only the example (visible) tests. Defaults to true. */
  includeHidden?: boolean;
}

/** Run the learner's code for a problem against its tests. */
export async function runProblem(fullProblem: CodeProblem, code: string, options: RunOptions = {}): Promise<RunReport> {
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
      const response = await runInWorker(
        { kind: 'sql', setup: problem.setup ?? '', user: code, reference: problem.solution, tests: problem.tests, ordered: Boolean(problem.ordered) },
        SQL_TIMEOUT_MS,
      );
      return report(response.results, response);
    }

    const source = stripModuleSyntax(code);
    let runnable = source;
    const preResults: TestResult[] = [];

    if (problem.language === 'ts') {
      const checked = await typeCheck(source, problem.typeTests ?? []);
      preResults.push(...checked.results);
    }
    if (problem.language !== 'js') {
      const out = await transpile(source, problem.language === 'jsx' || problem.language === 'rn');
      if (out.errors.length > 0) {
        const message = `Syntax error:\n${out.errors.slice(0, 5).join('\n')}`;
        return report([...preResults, ...problem.tests.map((t) => ({ name: t.name, passed: false, message }))], { error: message });
      }
      runnable = out.code;
    }

    if (problem.tests.length === 0) return report(preResults);

    const response = await runInWorker(
      {
        kind: 'js',
        mode: problem.language === 'jsx' ? 'react' : problem.language === 'rn' ? 'rn' : 'plain',
        code: runnable,
        exports: problem.exports ?? [],
        setup: problem.setup ?? '',
        tests: problem.tests,
      },
      JS_TIMEOUT_MS,
    );
    return report([...preResults, ...response.results], response);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return report([], { error: `Could not run the tests: ${message}` });
  }
}
