/**
 * "Solve it in VS Code": a single runnable .js file with the brief, the learner's code and the
 * exercise's tests. `node file.js` prints ✓/✗ per check; only the code above the CHECKS line goes
 * back into the app.
 */
import type { CodeProblem } from '../types/checkpoint';

export const CHECKS_MARKER = '// ---- CHECKS';

/** Keeps only the learner's code when a whole downloaded file is pasted back into the app. */
export function stripChecks(code: string): string {
  const index = code.indexOf(CHECKS_MARKER);
  return index === -1 ? code : code.slice(0, index).trimEnd() + '\n';
}

/** A small, dependency-free copy of the in-app `expect`, so checks behave the same in Node. */
const HARNESS = String.raw`
  const fmt = (v) => {
    if (typeof v === 'string') return JSON.stringify(v);
    if (typeof v === 'function') return '[Function]';
    if (v === undefined) return 'undefined';
    if (typeof v === 'number' && Number.isNaN(v)) return 'NaN';
    try { return JSON.stringify(v); } catch { return String(v); }
  };
  const deepEqual = (a, b) => {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
    const ka = Object.keys(a).filter((k) => a[k] !== undefined);
    const kb = Object.keys(b).filter((k) => b[k] !== undefined);
    return ka.length === kb.length && ka.every((k) => deepEqual(a[k], b[k]));
  };
  const expect = (actual) => {
    const make = (negate) => {
      const check = (pass, message) => { if (pass === negate) throw new Error(negate ? 'Expected the opposite: ' + message : message); };
      return {
        toBe: (e) => check(Object.is(actual, e), 'Expected ' + fmt(e) + ', received ' + fmt(actual)),
        toEqual: (e) => check(deepEqual(actual, e), 'Expected ' + fmt(e) + ', received ' + fmt(actual)),
        toBeCloseTo: (e, d = 2) => check(typeof actual === 'number' && Math.abs(actual - e) < Math.pow(10, -d) / 2, 'Expected about ' + e + ', received ' + fmt(actual)),
        toContain: (item) => check(Array.isArray(actual) ? actual.some((x) => deepEqual(x, item)) : typeof actual === 'string' && actual.includes(String(item)), 'Expected ' + fmt(actual) + ' to contain ' + fmt(item)),
        toHaveLength: (n) => check(actual != null && actual.length === n, 'Expected length ' + n + ', received ' + (actual == null ? fmt(actual) : actual.length)),
        toBeTruthy: () => check(Boolean(actual), 'Expected a truthy value, received ' + fmt(actual)),
        toBeFalsy: () => check(!actual, 'Expected a falsy value, received ' + fmt(actual)),
        toBeNull: () => check(actual === null, 'Expected null, received ' + fmt(actual)),
        toBeUndefined: () => check(actual === undefined, 'Expected undefined, received ' + fmt(actual)),
        toBeGreaterThan: (n) => check(typeof actual === 'number' && actual > n, 'Expected more than ' + n + ', received ' + fmt(actual)),
        toBeLessThan: (n) => check(typeof actual === 'number' && actual < n, 'Expected less than ' + n + ', received ' + fmt(actual)),
        toBeInstanceOf: (C) => check(actual instanceof C, 'Expected an instance of ' + C.name),
        toMatch: (re) => check(typeof actual === 'string' && re.test(actual), 'Expected ' + fmt(actual) + ' to match ' + re),
        toThrow: (sub) => {
          let threw = false; let msg = '';
          try { actual(); } catch (e) { threw = true; msg = e && e.message ? e.message : String(e); }
          check(threw && (!sub || msg.includes(sub)), threw ? 'Expected the error message to include "' + sub + '", received "' + msg + '"' : 'Expected the function to throw an error');
        },
        toReject: async (sub) => {
          let threw = false; let msg = '';
          try { await (typeof actual === 'function' ? actual() : actual); } catch (e) { threw = true; msg = e && e.message ? e.message : String(e); }
          check(threw && (!sub || msg.includes(sub)), threw ? 'Expected the error message to include "' + sub + '", received "' + msg + '"' : 'Expected the promise to reject');
        },
      };
    };
    return Object.assign(make(false), { not: make(true) });
  };
  const assert = (condition, message = 'Assertion failed') => { if (!condition) throw new Error(message); };
`;

const comment = (text: string) =>
  text
    .split('\n')
    .map((line) => (line.trim() === '' ? ' *' : ` * ${line.replace(/\*\//g, '* /')}`))
    .join('\n');

export interface ExerciseFileInfo {
  heading: string;
}

/**
 * Randomised checks compare against the reference solution (`ref`, `sameAsRef`) or use the
 * app's seeded `rand`. Shipping them would put the solution in the file, so they only run in
 * the app, which is where an exercise is actually graded.
 */
export function runsOnlyInApp(code: string): boolean {
  return /\b(?:ref\.|rand\.|sameAsRef\()/.test(code);
}

export function buildExerciseFile(problem: CodeProblem, code: string, info: ExerciseFileInfo): string {
  const local = problem.tests.filter((t) => !runsOnlyInApp(t.code));
  const appOnly = problem.tests.length - local.length;
  const tests = local
    .map((t) => `    { name: ${JSON.stringify(t.name)}, run: async () => {\n${indent(problem.setup ?? '', 6)}\n${indent(t.code, 6)}\n    } },`)
    .join('\n');
  return `/*
 * ${info.heading}
 * ${problem.title}
 *
${comment(problem.prompt)}
 *
 * How to use this file:
 *   1. Write your solution below.
 *   2. In the VS Code terminal, run:  node ${fileNameFor(problem)}
 *   3. When every check passes, copy everything ABOVE the "CHECKS" line into the app and press Run tests.${
    appOnly > 0 ? `\n *      The app also runs ${appOnly} more check${appOnly === 1 ? '' : 's'} with random inputs, so make your code work for any input.` : ''
  }
 */

${stripChecks(code).trimEnd()}

${CHECKS_MARKER}: run "node ${fileNameFor(problem)}". Do not edit below this line. ----
(async () => {${HARNESS}
  const tests = [
${tests}
  ];
  let passed = 0;
  for (const test of tests) {
    try {
      await test.run();
      passed++;
      console.log('\\u2713 ' + test.name);
    } catch (error) {
      console.log('\\u2717 ' + test.name + '\\n    ' + (error && error.message ? error.message : String(error)));
    }
  }
  console.log('\\n' + passed + ' of ' + tests.length + ' checks passed');
  if (passed !== tests.length) process.exitCode = 1;
})();
`;
}

function indent(text: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return text
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

export function fileNameFor(problem: CodeProblem): string {
  return `${problem.id}.js`;
}
