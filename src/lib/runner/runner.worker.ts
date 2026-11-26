/// <reference lib="webworker" />
/**
 * Runs learner code against tests, isolated from the page. The main thread terminates this
 * worker after a timeout, so infinite loops cannot freeze the app.
 */
import type { TestResult } from '../../types/checkpoint';
import type { JsRequest, SqlRequest, WorkerRequest, WorkerResponse } from './protocol';

type AnyFn = (...args: unknown[]) => unknown;
type Dict = Record<string, unknown>;

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
  ...args: string[]
) => (...args: unknown[]) => Promise<unknown>;

const TEST_TIMEOUT_MS = 2000;

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
  if (Object.is(a, b)) return true;
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  const ka = Object.keys(a).filter((k) => (a as Dict)[k] !== undefined);
  const kb = Object.keys(b).filter((k) => (b as Dict)[k] !== undefined);
  return ka.length === kb.length && ka.every((k) => deepEqual((a as Dict)[k], (b as Dict)[k]));
}

function expect(actual: unknown) {
  const make = (negate: boolean) => {
    const check = (pass: boolean, message: string) => {
      if (pass === negate) throw new AssertionError(negate ? `Expected the opposite: ${message}` : message);
    };
    return {
      toBe: (expected: unknown) => check(Object.is(actual, expected), `Expected ${show(expected)}, received ${show(actual)}`),
      toEqual: (expected: unknown) => check(deepEqual(actual, expected), `Expected ${show(expected)}, received ${show(actual)}`),
      toBeCloseTo: (expected: number, digits = 2) =>
        check(typeof actual === 'number' && Math.abs(actual - expected) < 10 ** -digits / 2, `Expected about ${expected}, received ${show(actual)}`),
      toContain: (item: unknown) =>
        check(
          Array.isArray(actual) ? actual.some((x) => deepEqual(x, item)) : typeof actual === 'string' && actual.includes(String(item)),
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
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

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

async function runJs(req: JsRequest): Promise<WorkerResponse> {
  const logs: string[] = [];
  const capture =
    (prefix: string) =>
    (...args: unknown[]) => {
      if (logs.length < 200) logs.push(prefix + args.map((a) => fmt(a)).join(' '));
    };
  const userConsole = { log: capture(''), info: capture(''), debug: capture(''), table: capture(''), warn: capture('⚠ '), error: capture('✖ ') };

  let userGlobals: Dict = {};
  let testHelpers: Dict = {};
  if (req.mode !== 'plain') ({ userGlobals, testHelpers } = await reactHelpers(req.mode));

  const globalNames = Object.keys(userGlobals);
  const returnObject = `{${req.exports.map((n) => `${JSON.stringify(n)}: typeof ${n} === "undefined" ? undefined : ${n}`).join(', ')}}`;

  let api: Dict;
  try {
    const factory = new Function('console', ...globalNames, `"use strict";\n${req.code}\n;return ${returnObject};`) as AnyFn;
    api = factory(userConsole, ...globalNames.map((n) => userGlobals[n])) as Dict;
  } catch (err) {
    const message = `Your code could not run: ${errorMessage(err)}`;
    return { results: req.tests.map((t) => ({ name: t.name, passed: false, message })), logs, error: message };
  }

  const missing = req.exports.filter((n) => typeof api[n] === 'undefined');
  if (missing.length > 0) {
    const message = `Define ${missing.map((n) => `\`${n}\``).join(' and ')} in your code (check the spelling).`;
    return { results: req.tests.map((t) => ({ name: t.name, passed: false, message })), logs };
  }

  const helpers: Dict = { expect, assert, ...testHelpers };
  const paramNames = [...req.exports, ...Object.keys(helpers)];
  const paramValues = [...req.exports.map((n) => api[n]), ...Object.values(helpers)];
  // Learner code may read globals such as fetch; tests can replace them, so restore after each test.
  const originalFetch = (globalThis as Dict).fetch;

  const results: TestResult[] = [];
  for (const test of req.tests) {
    try {
      const fn = new AsyncFunction(...paramNames, `"use strict";\n${req.setup}\n${test.code}`);
      await withTimeout(fn(...paramValues), TEST_TIMEOUT_MS);
      results.push({ name: test.name, passed: true });
    } catch (err) {
      const assertion = err instanceof AssertionError;
      results.push({ name: test.name, passed: false, message: assertion ? err.message : `Your code threw an error: ${errorMessage(err)}` });
    } finally {
      (globalThis as Dict).fetch = originalFetch;
    }
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

async function runSql(req: SqlRequest): Promise<WorkerResponse> {
  const initSqlJs = (await import('sql.js')).default;
  const wasmUrl = (await import('sql.js/dist/sql-wasm.wasm?url')).default;
  const SQL = await initSqlJs({ locateFile: () => wasmUrl });

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

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const req = event.data;
  let response: WorkerResponse;
  try {
    response = req.kind === 'sql' ? await runSql(req) : await runJs(req);
  } catch (err) {
    response = { results: [], logs: [], error: errorMessage(err) };
  }
  (self as unknown as Worker).postMessage(response);
};
