/** The engine must not be fooled by learner code that tampers with the built-ins it relies on. */
import { describe, expect, it } from 'vitest';
import { createRand, runJs } from './engine';
import type { JsRequest } from './protocol';

const request = (code: string, test: string): JsRequest => ({
  kind: 'js',
  mode: 'plain',
  code,
  reference: 'function answer() { return 42; }',
  exports: ['answer'],
  setup: '',
  tests: [{ name: 'answer is 42', code: test }],
  seed: 1,
});

const passes = async (code: string, test: string) => {
  const { results } = await runJs(request(code, test));
  // A plain loop: the learner code under test may have replaced Array.prototype.every.
  for (const r of results) if (!r.passed) return false;
  return results.length > 0;
};

describe('engine', () => {
  it('passes honest code and fails wrong code', async () => {
    expect(await passes('function answer() { return 42; }', 'expect(answer()).toBe(42);')).toBe(true);
    expect(await passes('function answer() { return 41; }', 'expect(answer()).toBe(42);')).toBe(false);
  });

  // In the app each run gets a fresh worker; here the tampering would leak into vitest, so the
  // originals are put back after each case.
  const originals = { is: Object.is, keys: Object.keys, isArray: Array.isArray, every: Array.prototype.every };
  const restore = () => {
    Object.is = originals.is;
    Object.keys = originals.keys;
    Array.isArray = originals.isArray;
    Array.prototype.every = originals.every;
  };

  it.each([
    ['Object.is', 'Object.is = () => true;'],
    ['Object.keys', 'Object.keys = () => [];'],
    ['Array.isArray', 'Array.isArray = () => true;'],
    ['Array.prototype.every', 'Array.prototype.every = () => true;'],
  ])('is not fooled by replacing %s', async (_, tamper) => {
    const code = `${tamper}\nfunction answer() { return { wrong: [1] }; }`;
    try {
      const deep = await passes(code, 'expect(answer()).toEqual({ right: [2] });');
      restore();
      const strict = await passes(code, 'expect(answer()).toBe(42);');
      restore();
      expect([deep, strict]).toEqual([false, false]);
    } finally {
      restore();
    }
  });

  it('gives tests the reference solution and a comparison helper', async () => {
    expect(await passes('function answer() { return 42; }', 'expect(answer()).toBe(ref.answer()); await sameAsRef("answer", () => []);')).toBe(true);
    const report = await runJs(request('function answer(x) { return x === 1 ? 42 : 0; }', 'await sameAsRef("answer", () => [rand.int(2, 9)]);'));
    expect(report.results[0]?.passed).toBe(false);
    expect(report.results[0]?.message).toMatch(/^answer\(\d\) should return 42, received 0$/);
  });

  it('sameAsRef requires the same error when the reference throws', async () => {
    const req = { ...request('function answer() { throw new Error("nope"); }', 'await sameAsRef("answer", () => []);'), reference: 'function answer() { throw new Error("size must be at least 1"); }' };
    const report = await runJs(req);
    expect(report.results[0]?.message).toBe('answer() should throw "size must be at least 1", but threw "nope"');
  });

  it('rand is deterministic per seed and differs between seeds', () => {
    const sample = (seed: number) => {
      const r = createRand(seed);
      return r.list(20, () => r.int(0, 1000));
    };
    expect(sample(7)).toEqual(sample(7));
    expect(sample(8)).not.toEqual(sample(7));
    const r = createRand(3);
    for (let i = 0; i < 200; i++) {
      const n = r.int(-5, 5);
      expect(n >= -5 && n <= 5 && Number.isInteger(n)).toBe(true);
    }
  });
});
