/**
 * Every coding problem in the curriculum, run in Node through the same engine the app uses:
 * - the reference solution passes (under several random seeds, so randomised tests are not flaky);
 * - the starter fails;
 * - a learner who only memorises outputs cannot pass. For js/ts problems the "cheat" answers each
 *   call from a table recorded on an earlier run; for SQL it returns the expected rows as literals.
 *   Both must fail, which forces tests on inputs that change between runs (`rand` + `ref`) or,
 *   for SQL, checks that re-run the query on changed data (`{{user}}`).
 */
import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';
import type { CodeProblem } from '../../types/checkpoint';
import { runJs, runSql, type JsOptions } from './engine';
import { runProblemWith, type Executor } from './index';
import { checkProblemShape, checkQuestions, collectContent, duplicateIds, failures } from './validate';

type Dict = Record<string, unknown>;

const loadSql = () => initSqlJs();

function executor(options: JsOptions = {}, seed?: number): Executor {
  return (request) => (request.kind === 'sql' ? runSql(request, loadSql) : runJs(seed === undefined ? request : { ...request, seed }, options));
}

const run = (problem: CodeProblem, code: string, options?: JsOptions, seed?: number) => runProblemWith(executor(options, seed), problem, code);

/**
 * Problems where answering from memory is the honest solution (there is nothing to randomise),
 * Type-only problems (no runtime tests) are skipped too: their type tests use varied values instead.
 */
const MEMO_CHEAT_EXEMPT: Record<string, string> = {
  'p1-l1-challenge': 'fixing three syntax errors in a function with no inputs',
};

// ---------- The memorising cheat (js / ts) ----------

const isClass = (fn: unknown) => typeof fn === 'function' && /^class\b/.test(Function.prototype.toString.call(fn));

function keyOf(args: unknown[]): string | null {
  try {
    const key = JSON.stringify(args);
    return key === undefined ? null : key;
  } catch {
    return null;
  }
}

interface Recorded {
  async: boolean;
  json: string;
}

/** Wraps the real exports and records every call's arguments and result. */
function recorder(table: Map<string, Recorded>): JsOptions {
  return {
    instrument: (api) => {
      const out: Dict = {};
      for (const [name, value] of Object.entries(api)) {
        if (typeof value !== 'function' || isClass(value)) {
          out[name] = value;
          continue;
        }
        const fn = value as (...args: unknown[]) => unknown;
        out[name] = (...args: unknown[]) => {
          const key = keyOf([name, ...args]);
          const result = fn(...args);
          const save = (v: unknown, async: boolean) => {
            const json = keyOf([v]);
            if (key !== null && json !== null) table.set(key, { async, json });
          };
          if (result instanceof Promise) result.then((v) => save(v, true), () => {});
          else save(result, false);
          return result;
        };
      }
      return out;
    },
  };
}

/** Replaces every function with one that only knows the recorded answers. */
function memoriser(table: Map<string, Recorded>): JsOptions {
  return {
    instrument: (api) => {
      const out: Dict = {};
      for (const [name, value] of Object.entries(api)) {
        out[name] =
          typeof value === 'function'
            ? (...args: unknown[]) => {
                const key = keyOf([name, ...args]);
                const hit = key === null ? undefined : table.get(key);
                if (!hit) return undefined;
                const v = (JSON.parse(hit.json) as unknown[])[0];
                return hit.async ? Promise.resolve(v) : v;
              }
            : value;
      }
      return out;
    },
  };
}

async function memoCheatPasses(problem: CodeProblem): Promise<boolean> {
  const table = new Map<string, Recorded>();
  await run(problem, problem.solution, recorder(table), 1);
  const cheat = await run(problem, problem.solution, memoriser(table), 2);
  return cheat.passed;
}

// ---------- The literal-rows cheat (SQL) ----------

async function literalCheat(problem: CodeProblem): Promise<string | null> {
  const SQL = await loadSql();
  const db = new SQL.Database();
  try {
    const out = db.exec(`${problem.setup ?? ''}\n${problem.solution}`);
    const last = out[out.length - 1];
    if (!last || last.values.length === 0) return null;
    const lit = (v: unknown) => (v === null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
    return last.values.map((row) => `SELECT ${row.map((v, i) => `${lit(v)} AS "${last.columns[i]}"`).join(', ')}`).join('\nUNION ALL\n') + ';';
  } finally {
    db.close();
  }
}

// ---------- The suite ----------

const { problems, questions, issues: structural } = collectContent();

describe('curriculum content', () => {
  it('is complete and has unique ids', () => {
    expect([...structural, ...duplicateIds(problems, questions)]).toEqual([]);
  });

  it('has well-formed questions', () => {
    expect(questions.flatMap(checkQuestions)).toEqual([]);
  });
});

describe.each(problems)('$where', (entry) => {
  const { problem } = entry;

  it('is well-formed', () => {
    expect(checkProblemShape(entry)).toEqual([]);
  });

  it('reference solution passes every test, whatever the random seed', async () => {
    for (const seed of [11, 222, 3333]) {
      const report = await run(problem, problem.solution, {}, seed);
      expect(report.passed, failures(report)).toBe(true);
    }
  });

  it('starter fails', async () => {
    expect((await run(problem, problem.starter)).passed).toBe(false);
  });

  if (problem.language === 'sql') {
    // If the reference errors too, the runner counts the test as passed, so a {{user}} check
    // with broken data (say, a delete that violates a foreign key) would silently check nothing.
    it('re-runs the query on data the reference can handle', async () => {
      const SQL = await loadSql();
      for (const test of problem.tests.filter((t) => t.code.includes('{{user}}'))) {
        const db = new SQL.Database();
        try {
          expect(() => db.exec(`${problem.setup ?? ''}\n${test.code.split('{{user}}').join(problem.solution)}`), test.name).not.toThrow();
        } finally {
          db.close();
        }
      }
    });

    it('cannot be passed by returning the expected rows as literals', async () => {
      const cheat = await literalCheat(problem);
      if (cheat === null) return;
      expect((await run(problem, cheat)).passed, cheat).toBe(false);
    });
  } else if ((problem.language === 'js' || problem.language === 'ts') && problem.tests.length > 0 && !MEMO_CHEAT_EXEMPT[problem.id]) {
    it('cannot be passed by memorising outputs', async () => {
      expect(await memoCheatPasses(problem)).toBe(false);
    });
  }
});
