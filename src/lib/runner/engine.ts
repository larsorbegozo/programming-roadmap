/**
 * The test engine: runs learner code against a problem's tests. Pure and environment-agnostic,
 * so the browser runs it inside a Web Worker (runner.worker.ts) and `npm test` runs it in Node
 * to check every problem's content.
 *
 * Anti-shortcut tools for tests:
 * - `ref`: the reference solution's exports, so a test can compare the learner's output with the
 *   correct one on inputs nobody wrote down in advance.
 * - `rand`: a seeded random generator; the seed changes on every run, so those inputs change too
 *   and memorising the expected outputs from failure messages does not work.
 */
import type { SqlJsStatic } from 'sql.js';
import type { TestResult } from '../../types/checkpoint';
import type { JsRequest, SqlRequest, WorkerResponse } from './protocol';

type AnyFn = (...args: unknown[]) => unknown;
type Dict = Record<string, unknown>;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

const TEST_TIMEOUT_MS = 2000;

/**
 * Built-ins the assertions depend on, captured before any learner code runs. Learner code shares
 * this global scope, so `Object.is = () => true` must not be able to make every assertion pass.
 */
const same = Object.is;
const ownKeys = Object.keys;
const isArray = Array.isArray;
const timeOf = Function.prototype.call.bind(Date.prototype.getTime) as (d: Date) => number;

class AssertionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AssertionError';
  }
}

function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.name && err.name !== 'Error' && err.name !== 'AssertionError' ? `${err.name}: ${err.message}` : err.message;
  return String(err);
}

// ---------- Formatting & assertions ----------

function fmt(value: unknown, depth = 0): string {
  if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value);
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
  if (value === undefined) return 'undefined';
  if (typeof value === 'bigint') return `${value}n`;
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Date) return `Date(${value.toISOString()})`;
  if (Array.isArray(value)) return depth > 4 ? '[…]' : `[${value.map((v) => fmt(v, depth + 1)).join(', ')}]`;
  if (value instanceof Map) return `Map(${value.size})`;
  if (value instanceof Set) return `Set(${value.size})`;
  if (value && typeof value === 'object') {
    if (depth > 4) return '{…}';
    const entries = Object.entries(value as Dict);
    if (entries.length === 0) return '{}';
    return `{ ${entries.map(([k, v]) => `${k}: ${fmt(v, depth + 1)}`).join(', ')} }`;
  }
  return String(value);
}

const show = (v: unknown) => {
  const s = fmt(v, 1);
  return s.length > 300 ? `${s.slice(0, 300)}…` : s;
};

/** Structural equality; like Jest's toEqual, properties set to undefined count as missing. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (same(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return same(timeOf(a), timeOf(b));
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (isArray(a) !== isArray(b)) return false;
  if (isArray(a) && isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  const defined = (o: Dict) => {
    const keys: string[] = [];
    for (const k of ownKeys(o)) if (o[k] !== undefined) keys[keys.length] = k;
    return keys;
  };
  const ka = defined(a as Dict);
  const kb = defined(b as Dict);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if (!deepEqual((a as Dict)[k], (b as Dict)[k])) return false;
  return true;
}

function expect(actual: unknown) {
  const make = (negate: boolean) => {
    const check = (pass: boolean, message: string) => {
      if (pass === negate) throw new AssertionError(negate ? `Expected the opposite: ${message}` : message);
    };
    return {
      toBe: (expected: unknown) => check(same(actual, expected), `Expected ${show(expected)}, received ${show(actual)}`),
      toEqual: (expected: unknown) => check(deepEqual(actual, expected), `Expected ${show(expected)}, received ${show(actual)}`),
      toBeCloseTo: (expected: number, digits = 2) =>
        check(typeof actual === 'number' && Math.abs(actual - expected) < 10 ** -digits / 2, `Expected about ${expected}, received ${show(actual)}`),
      toContain: (item: unknown) =>
        check(
          isArray(actual) ? (actual as unknown[]).some((x) => deepEqual(x, item)) : typeof actual === 'string' && actual.includes(String(item)),
          `Expected ${show(actual)} to contain ${show(item)}`,
        ),
      toHaveLength: (n: number) =>
        check(actual != null && (actual as { length?: number }).length === n, `Expected length ${n}, received ${actual == null ? show(actual) : (actual as { length?: number }).length}`),
      toBeTruthy: () => check(Boolean(actual), `Expected a truthy value, received ${show(actual)}`),
      toBeFalsy: () => check(!actual, `Expected a falsy value, received ${show(actual)}`),
      toBeNull: () => check(actual === null, `Expected null, received ${show(actual)}`),
      toBeUndefined: () => check(actual === undefined, `Expected undefined, received ${show(actual)}`),
      toBeGreaterThan: (n: number) => check(typeof actual === 'number' && actual > n, `Expected more than ${n}, received ${show(actual)}`),
      toBeLessThan: (n: number) => check(typeof actual === 'number' && actual < n, `Expected less than ${n}, received ${show(actual)}`),
      toBeInstanceOf: (C: new (...a: never[]) => unknown) => check(actual instanceof C, `Expected an instance of ${C.name}, received ${show(actual)}`),
      toMatch: (re: RegExp) => check(typeof actual === 'string' && re.test(actual), `Expected ${show(actual)} to match ${re}`),
      toThrow: (substring?: string) => {
        let threw = false;
        let msg = '';
        try {
          (actual as AnyFn)();
        } catch (e) {
          threw = true;
          msg = e instanceof Error ? e.message : String(e);
        }
        check(
          threw && (!substring || msg.includes(substring)),
          threw ? `Expected the error message to include "${substring}", received "${msg}"` : 'Expected the function to throw an error',
        );
      },
      toReject: async (substring?: string) => {
        let threw = false;
        let msg = '';
        try {
          await (typeof actual === 'function' ? (actual as AnyFn)() : actual);
        } catch (e) {
          threw = true;
          msg = e instanceof Error ? e.message : String(e);
        }
        check(
          threw && (!substring || msg.includes(substring)),
          threw ? `Expected the error message to include "${substring}", received "${msg}"` : 'Expected the promise to reject',
        );
      },
    };
  };
  return Object.assign(make(false), { not: make(true) });
}

function assert(condition: unknown, message = 'Assertion failed'): asserts condition {
  if (!condition) throw new AssertionError(message);
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new AssertionError(`Timed out after ${ms / 1000}s. Is a promise never resolving, or a loop never ending?`)), ms);
    // `await` rather than `.then`, which learner code could have replaced on Promise.prototype.
    void (async () => {
      try {
        resolve(await promise);
      } catch (e) {
        reject(e);
      } finally {
        clearTimeout(timer);
      }
    })();
  });
}

// ---------- Seeded randomness for tests ----------

/** Random test inputs. `seed` differs on every run, so the inputs (and expected outputs) do too. */
export function createRand(seed: number) {
  let state = seed >>> 0;
  const next = () => {
    // mulberry32
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  const pick = <T,>(items: readonly T[]): T => items[int(0, items.length - 1)] as T;
  const list = <T,>(length: number, make: (index: number) => T): T[] => Array.from({ length }, (_, i) => make(i));
  const word = (minLength = 3, maxLength = 8) => list(int(minLength, maxLength), () => String.fromCharCode(97 + int(0, 25))).join('');
  const shuffle = <T,>(items: readonly T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(0, i);
      [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
    }
    return copy;
  };
  return {
    seed,
    /** A float in [0, 1). */
    next,
    /** An integer in [min, max], both included. */
    int,
    float: (min: number, max: number) => min + next() * (max - min),
    bool: () => next() < 0.5,
    pick,
    list,
    /** A lowercase word of random letters. */
    word,
    shuffle,
    /** `count` distinct values from `make` (retries duplicates). */
    distinct: <T,>(count: number, make: () => T): T[] => {
      const seen = new Set<string>();
      const out: T[] = [];
      for (let tries = 0; out.length < count && tries < count * 50; tries++) {
        const value = make();
        const key = JSON.stringify(value);
        if (!seen.has(key)) {
          seen.add(key);
          out.push(value);
        }
      }
      return out;
    },
  };
}

export type Rand = ReturnType<typeof createRand>;

// ---------- React helpers ----------

interface TestInstance {
  type: unknown;
  props: Dict;
  parent: TestInstance | null;
  children: Array<TestInstance | string>;
  findAll: (predicate: (node: TestInstance) => boolean) => TestInstance[];
}

async function reactHelpers(mode: 'react' | 'rn') {
  const React = (await import('react')).default;
  const TestRenderer = (await import('react-test-renderer')).default;

  const textOf = (node: TestInstance | string): string => (typeof node === 'string' ? node : node.children.map(textOf).join(''));
  const isHost = (n: TestInstance) => typeof n.type === 'string';

  function render(element: unknown) {
    // Legacy-mode test renderer: updates from handlers called directly are flushed synchronously,
    // which works in both development and production builds of React (act() does not).
    const renderer = TestRenderer.create(element as never);
    const root = renderer.root as unknown as TestInstance;
    const hosts = () => root.findAll(isHost);

    const findHandler = (node: TestInstance, prop: string): AnyFn => {
      let current: TestInstance | null = node;
      while (current) {
        const handler = current.props[prop];
        if (typeof handler === 'function' && !current.props.disabled) return handler as AnyFn;
        if (typeof handler === 'function' && current.props.disabled) throw new AssertionError('That element is disabled.');
        current = current.parent;
      }
      throw new AssertionError(`No ${prop} handler found on that element or its parents.`);
    };

    const byText = (text: string, type?: string): TestInstance => {
      const matches = hosts().filter((n) => (!type || n.type === type) && textOf(n).includes(text));
      if (matches.length === 0) throw new AssertionError(`Could not find ${type ? `a <${type}>` : 'an element'} with the text "${text}". Rendered text: "${textOf(root).slice(0, 200)}"`);
      // The deepest match is the most specific element.
      return matches.reduce((best, n) => (textOf(n).length <= textOf(best).length ? n : best));
    };

    const queryByTestId = (id: string): TestInstance | null => hosts().find((n) => n.props.testID === id) ?? null;

    return {
      root,
      text: () => textOf(root),
      findAll: (type: string) => root.findAll((n) => n.type === type),
      byText,
      queryByText: (text: string, type?: string) => {
        try {
          return byText(text, type);
        } catch {
          return null;
        }
      },
      byTestId: (id: string) => {
        const node = queryByTestId(id);
        if (!node) throw new AssertionError(`Could not find an element with testID "${id}".`);
        return node;
      },
      queryByTestId,
      textOf,
      click: (node: TestInstance) => {
        findHandler(node, 'onClick')({ preventDefault() {}, stopPropagation() {}, target: node.props });
      },
      press: (node: TestInstance) => {
        findHandler(node, 'onPress')();
      },
      type: (node: TestInstance, value: string) => {
        if (typeof node.props.onChangeText === 'function') (node.props.onChangeText as AnyFn)(value);
        else if (typeof node.props.onChange === 'function') (node.props.onChange as AnyFn)({ target: { value } });
        else throw new AssertionError('That element has no onChangeText or onChange handler.');
      },
      rerender: (next: unknown) => renderer.update(next as never),
      unmount: () => renderer.unmount(),
    };
  }

  /** Elements inside arrays (lists) that are missing a key prop. Works on components without hooks. */
  function keylessListItems(element: unknown): number {
    let missing = 0;
    const visit = (node: unknown, inArray: boolean) => {
      if (Array.isArray(node)) return node.forEach((child) => visit(child, true));
      if (!node || typeof node !== 'object' || !('props' in node)) return;
      const el = node as { key: unknown; props: Dict };
      if (inArray && (el.key === null || el.key === undefined)) missing++;
      visit(el.props.children, false);
    };
    visit(element, false);
    return missing;
  }

  const flush = () => new Promise((r) => setTimeout(r, 0));

  const userGlobals: Dict = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useMemo: React.useMemo,
    useRef: React.useRef,
    useCallback: React.useCallback,
    useReducer: React.useReducer,
    useContext: React.useContext,
    createContext: React.createContext,
    Fragment: React.Fragment,
  };

  if (mode === 'rn') {
    const host = (name: string) => {
      const Component = ({ children, ...props }: Dict) =>
        React.createElement(name, props, (typeof children === 'function' ? (children as AnyFn)({ pressed: false }) : children) as never);
      Component.displayName = name;
      return Component;
    };
    const FlatList = ({ data = [], renderItem, keyExtractor, ListEmptyComponent, ...rest }: Dict) => {
      const items = data as unknown[];
      const empty = ListEmptyComponent
        ? typeof ListEmptyComponent === 'function'
          ? React.createElement(ListEmptyComponent as never)
          : (ListEmptyComponent as never)
        : null;
      return React.createElement(
        'FlatList',
        rest,
        items.length === 0
          ? empty
          : items.map((item, index) =>
              React.createElement(
                React.Fragment,
                { key: String(keyExtractor ? (keyExtractor as AnyFn)(item, index) : ((item as Dict).key ?? (item as Dict).id ?? index)) },
                (renderItem as AnyFn)({ item, index }) as never,
              ),
            ),
      );
    };
    Object.assign(userGlobals, {
      View: host('View'),
      Text: host('Text'),
      Pressable: host('Pressable'),
      TouchableOpacity: host('TouchableOpacity'),
      ScrollView: host('ScrollView'),
      SafeAreaView: host('SafeAreaView'),
      TextInput: host('TextInput'),
      Image: host('Image'),
      Button: ({ title, onPress, disabled }: Dict) => React.createElement('Button', { onPress, disabled, title }, title as string),
      FlatList,
      StyleSheet: { create: <T,>(styles: T) => styles, flatten: <T,>(style: T) => style },
      Platform: { OS: 'android', select: (options: Dict) => options.android ?? options.default },
    });
  }

  return { userGlobals, testHelpers: { render, h: React.createElement, keylessListItems, flush } as Dict };
}

// ---------- JavaScript / TypeScript / React ----------

export interface JsOptions {
  /**
   * Node-only content checks: replace the learner's exports before the tests run, e.g. with a
   * "cheat" that answers from a table of memorised outputs, to prove the tests catch it.
   */
  instrument?: (api: Dict) => Dict;
}

/** Runs `code` as a plain script with the given globals and returns the requested top-level names. */
function evaluate(code: string, exportNames: string[], globals: Dict): Dict {
  const names = ownKeys(globals);
  const returnObject = `{${exportNames.map((n) => `${JSON.stringify(n)}: typeof ${n} === "undefined" ? undefined : ${n}`).join(', ')}}`;
  const factory = new Function(...names, `"use strict";\n${code}\n;return ${returnObject};`) as AnyFn;
  return factory(...names.map((n) => globals[n])) as Dict;
}

type Outcome = { threw: false; value: unknown } | { threw: true; message: string };

async function outcomeOf(call: () => unknown): Promise<Outcome> {
  try {
    return { threw: false, value: await call() };
  } catch (e) {
    return { threw: true, message: e instanceof Error ? e.message : String(e) };
  }
}

function copyArgs(args: unknown[]): unknown[] {
  try {
    return structuredClone(args);
  } catch {
    return args; // functions cannot be cloned; they are passed as they are
  }
}

/**
 * The randomised-test workhorse: calls the learner's `name` and the reference's with the same
 * fresh arguments, `runs` times, and fails with the exact input when the outcomes differ.
 * A thrown error counts as an outcome: both must throw, with the same message.
 */
function makeSameAsRef(api: Dict, ref: Dict) {
  return async (name: string, makeArgs: () => unknown[], runs = 25) => {
    const mine = api[name] as AnyFn;
    const theirs = ref[name] as AnyFn;
    if (typeof mine !== 'function') throw new AssertionError(`\`${name}\` is not a function.`);
    for (let i = 0; i < runs; i++) {
      const args = makeArgs();
      const call = `${name}(${args.map((a) => show(a)).join(', ')})`;
      const expected = await outcomeOf(() => theirs(...copyArgs(args)));
      const actual = await outcomeOf(() => mine(...copyArgs(args)));
      if (expected.threw) {
        if (!actual.threw) throw new AssertionError(`${call} should throw "${expected.message}", but returned ${show(actual.value)}`);
        if (actual.message !== expected.message) throw new AssertionError(`${call} should throw "${expected.message}", but threw "${actual.message}"`);
      } else if (actual.threw) {
        throw new AssertionError(`${call} should return ${show(expected.value)}, but threw "${actual.message}"`);
      } else if (!deepEqual(actual.value, expected.value)) {
        throw new AssertionError(`${call} should return ${show(expected.value)}, received ${show(actual.value)}`);
      }
    }
  };
}

export async function runJs(req: JsRequest, options: JsOptions = {}): Promise<WorkerResponse> {
  const logs: string[] = [];
  const capture =
    (prefix: string) =>
    (...args: unknown[]) => {
      if (logs.length < 200) logs.push(prefix + args.map((a) => fmt(a)).join(' '));
    };
  const userConsole = { log: capture(''), info: capture(''), debug: capture(''), table: capture(''), warn: capture('⚠ '), error: capture('✖ ') };
  const silent = () => {};
  const quietConsole = { log: silent, info: silent, debug: silent, table: silent, warn: silent, error: silent };

  let userGlobals: Dict = {};
  let testHelpers: Dict = {};
  if (req.mode !== 'plain') ({ userGlobals, testHelpers } = await reactHelpers(req.mode));

  // The reference runs first, so nothing the learner's code does at load time can affect it.
  let ref: Dict;
  try {
    ref = evaluate(req.reference, req.exports, { ...userGlobals, console: quietConsole });
  } catch (err) {
    throw new Error(`Reference solution failed to load: ${errorMessage(err)}`);
  }

  let api: Dict;
  try {
    api = evaluate(req.code, req.exports, { ...userGlobals, console: userConsole });
  } catch (err) {
    const message = `Your code could not run: ${errorMessage(err)}`;
    return { results: req.tests.map((t) => ({ name: t.name, passed: false, message })), logs, error: message };
  }

  const missing = req.exports.filter((n) => typeof api[n] === 'undefined');
  if (missing.length > 0) {
    const message = `Define ${missing.map((n) => `\`${n}\``).join(' and ')} in your code (check the spelling).`;
    return { results: req.tests.map((t) => ({ name: t.name, passed: false, message })), logs };
  }
  if (options.instrument) api = options.instrument(api);

  // Learner code may read globals such as fetch; tests can replace them, so restore after each test.
  const originalFetch = (globalThis as Dict).fetch;

  const results: TestResult[] = [];
  for (const [index, test] of req.tests.entries()) {
    // Each test gets its own stream of random values, so tests stay independent of each other.
    const helpers: Dict = { expect, assert, ref, rand: createRand(req.seed + index * 7919), sameAsRef: makeSameAsRef(api, ref), ...testHelpers };
    const paramNames = [...req.exports, ...ownKeys(helpers)];
    const paramValues = [...req.exports.map((n) => api[n]), ...ownKeys(helpers).map((k) => helpers[k])];
    let result: TestResult;
    try {
      const fn = new AsyncFunction(...paramNames, `"use strict";\n${req.setup}\n${test.code}`);
      await withTimeout(fn(...paramValues), TEST_TIMEOUT_MS);
      result = { name: test.name, passed: true };
    } catch (err) {
      const assertion = err instanceof AssertionError;
      result = { name: test.name, passed: false, message: assertion ? err.message : `Your code threw an error: ${errorMessage(err)}` };
    } finally {
      (globalThis as Dict).fetch = originalFetch;
    }
    results[results.length] = result;
  }
  return { results, logs };
}

// ---------- SQL ----------

interface SqlOutcome {
  ok: boolean;
  error?: string;
  columns: string[];
  rows: unknown[][];
}

/** sql.js loads its WebAssembly differently in a browser worker and in Node, so the caller provides it. */
export async function runSql(req: SqlRequest, loadSql: () => Promise<SqlJsStatic>): Promise<WorkerResponse> {
  const SQL = await loadSql();

  const run = (statements: string[]): SqlOutcome => {
    const db = new SQL.Database();
    try {
      let last: { columns: string[]; values: unknown[][] } | undefined;
      for (const sql of statements) {
        const out = db.exec(sql);
        if (out.length > 0) last = out[out.length - 1];
      }
      return { ok: true, columns: last?.columns ?? [], rows: last?.values ?? [] };
    } catch (err) {
      return { ok: false, error: errorMessage(err), columns: [], rows: [] };
    } finally {
      db.close();
    }
  };

  const setupCheck = run([req.setup]);
  if (!setupCheck.ok) throw new Error(`Problem setup failed: ${setupCheck.error}`);

  const user = run([req.setup, req.user]);
  if (!user.ok) {
    const message = `SQL error: ${user.error}`;
    return { results: req.tests.map((t) => ({ name: t.name, passed: false, message })), logs: [], error: message };
  }
  const reference = run([req.setup, req.reference]);
  if (!reference.ok) throw new Error(`Reference solution failed: ${reference.error}`);

  const norm = (v: unknown) => (v === null ? 'NULL' : typeof v === 'number' ? String(Math.round(v * 1e6) / 1e6) : String(v));
  const rowKey = (r: unknown[]) => JSON.stringify(r.map(norm));

  const compare = (actual: SqlOutcome, expected: SqlOutcome): string | null => {
    if (expected.ok !== actual.ok) {
      return expected.ok
        ? `Expected this to succeed, but the database returned an error: ${actual.error}`
        : 'Expected the database to reject this, but it was accepted. A constraint is missing.';
    }
    if (!expected.ok) return null;
    if (expected.columns.length !== actual.columns.length)
      return `Expected ${expected.columns.length} column${expected.columns.length === 1 ? '' : 's'} (${expected.columns.join(', ')}), received ${actual.columns.length} (${actual.columns.join(', ') || 'none'}).`;
    if (expected.rows.length !== actual.rows.length) return `Expected ${expected.rows.length} row${expected.rows.length === 1 ? '' : 's'}, received ${actual.rows.length}.`;
    const exp = expected.rows.map(rowKey);
    const act = actual.rows.map(rowKey);
    if (!req.ordered) {
      exp.sort();
      act.sort();
    }
    const i = exp.findIndex((row, index) => row !== act[index]);
    if (i === -1) return null;
    return req.ordered && [...exp].sort().join() === [...act].sort().join()
      ? 'The rows are right but in the wrong order. Check ORDER BY.'
      : `Row ${i + 1} differs: expected ${exp[i]}, received ${act[i]}.`;
  };

  // A check containing {{user}} re-runs the learner's query after changing the data.
  const withQuery = (check: string, query: string) => (check.includes('{{user}}') ? [req.setup, check.split('{{user}}').join(query)] : [req.setup, query, check]);
  const results: TestResult[] = req.tests.map((test) => {
    const message = test.code.trim()
      ? compare(run(withQuery(test.code, req.user)), run(withQuery(test.code, req.reference)))
      : compare(user, reference);
    return message ? { name: test.name, passed: false, message } : { name: test.name, passed: true };
  });

  return { results, logs: [], table: { columns: user.columns, rows: user.rows.slice(0, 50) } };
}

