import { describe, expect, it } from 'vitest';
import { curriculum } from '../../data/curriculum';
import type { AppState } from '../../types/state';
import { createInitialState } from '../validation';
import { EMPTY_BASE, SyncError, isDirty, reconcileResult, serialize, syncOnce, type RemoteDoc, type RemoteStore, type SyncBase } from './engine';
import { hasProgress, mergeStates } from './merge';

/** An in-memory stand-in for the cloud table, with the same compare-and-swap rule as the real one. */
class FakeCloud implements RemoteStore {
  doc: { data: AppState; revision: number } | null = null;
  pushes = 0;
  failNextPushWithConflict = 0;
  async fetch(): Promise<RemoteDoc | null> {
    return this.doc ? { data: structuredClone(this.doc.data), revision: this.doc.revision } : null;
  }
  async fetchRevision() {
    return this.doc?.revision ?? null;
  }
  async push(data: AppState, base: number | null) {
    if (this.failNextPushWithConflict > 0) {
      this.failNextPushWithConflict--;
      return null;
    }
    if (base === null) {
      if (this.doc) return null;
      this.doc = { data: structuredClone(data), revision: 1 };
    } else {
      if (!this.doc || this.doc.revision !== base) return null;
      this.doc = { data: structuredClone(data), revision: base + 1 };
    }
    this.pushes++;
    return this.doc.revision;
  }
}

/** A device: its own local state and sync bookkeeping, like one browser. */
class Device {
  state = createInitialState();
  base: SyncBase = EMPTY_BASE;
  constructor(private cloud: FakeCloud) {}
  edit(change: (s: AppState) => void) {
    const next = structuredClone(this.state);
    change(next);
    this.state = next;
  }
  async sync() {
    const snapshot = serialize(this.state);
    const result = await syncOnce(this.state, this.base, this.cloud);
    const next = reconcileResult(this.state, snapshot, result);
    if (next) this.state = next;
    this.base = result.base;
    return result.kind;
  }
}

const L = (i: number, p = 0) => curriculum[p]!.lessons[i]!.id;
const t = (day: number) => `2026-12-${String(day).padStart(2, '0')}T10:00:00Z`;

describe('mergeStates', () => {
  it('keeps lessons completed on either device, with the earliest date', () => {
    const a = createInitialState();
    const b = createInitialState();
    a.completedLessons = { [L(0)]: t(5), [L(1)]: t(6) };
    b.completedLessons = { [L(1)]: t(4), [L(2)]: t(7) };
    const m = mergeStates(a, b, 'local');
    expect(Object.keys(m.completedLessons).sort()).toEqual([L(0), L(1), L(2)].sort());
    expect(m.completedLessons[L(1)]).toBe(t(4));
  });

  it('unions sessions by id and never duplicates them', () => {
    const a = createInitialState();
    const b = createInitialState();
    const s1 = { id: 's1', date: '2026-12-01', category: 'theory' as const, minutes: 60 };
    const s2 = { id: 's2', date: '2026-12-02', category: 'practice' as const, minutes: 30 };
    a.sessions = [s1];
    b.sessions = [s1, s2];
    expect(mergeStates(a, b, 'local').sessions.map((s) => s.id)).toEqual(['s1', 's2']);
  });

  it('keeps the longer note when both devices wrote one', () => {
    const a = createInitialState();
    const b = createInitialState();
    a.notes = { [L(0)]: 'short' };
    b.notes = { [L(0)]: 'a much longer note' };
    expect(mergeStates(a, b, 'local').notes[L(0)]).toBe('a much longer note');
  });

  it('takes the best quiz score and the earliest pass, and keeps solved problems', () => {
    const a = createInitialState();
    const b = createInitialState();
    a.checkpoints.p1 = { quiz: { bestScore: 70, attempts: 2 }, problems: { x: { code: 'a' } } };
    b.checkpoints.p1 = { quiz: { bestScore: 90, attempts: 1, passedAt: t(9) }, problems: { x: { code: 'solved', passedAt: t(8) } } };
    const m = mergeStates(a, b, 'local').checkpoints.p1!;
    expect(m.quiz).toEqual({ bestScore: 90, attempts: 2, passedAt: t(9) });
    expect(m.problems.x).toEqual({ code: 'solved', passedAt: t(8) });
  });

  it('keeps exam attempts from both devices', () => {
    const attempt = (sitting: number, at: string, passed: boolean) => ({
      sitting,
      startedAt: at,
      submittedAt: at,
      percent: passed ? 80 : 30,
      grade: passed ? 7 : 2,
      passed,
      questionResults: {},
      problemScores: {},
    });
    const a = createInitialState();
    const b = createInitialState();
    a.examAttempts.p0 = [attempt(0, t(3), false)];
    b.examAttempts.p0 = [attempt(0, t(3), false), attempt(1, t(10), true)];
    expect(mergeStates(a, b, 'local').examAttempts.p0!.map((x) => x.sitting)).toEqual([0, 1]);
  });

  it('takes the newest exam calendar and settings from the preferred side', () => {
    const a = createInitialState();
    const b = createInitialState();
    const plan = (createdAt: string, hours: number) => ({ createdAt, startDate: '2026-12-01', hoursPerWeek: hours, units: {} });
    a.examPlan = plan(t(1), 20);
    b.examPlan = plan(t(5), 10);
    a.settings.weeklyHoursTarget = 20;
    b.settings.weeklyHoursTarget = 5;
    expect(mergeStates(a, b, 'local').examPlan?.hoursPerWeek).toBe(10);
    expect(mergeStates(a, b, 'local').settings.weeklyHoursTarget).toBe(20);
    expect(mergeStates(a, b, 'remote').settings.weeklyHoursTarget).toBe(5);
  });

  it('keeps one exam in progress (the earliest) and drops it once submitted', () => {
    const exam = (startedAt: string) => ({ phaseId: 'p1', sitting: 0, startedAt, answers: {}, code: {}, orders: {} });
    const a = createInitialState();
    const b = createInitialState();
    a.activeExam = exam(t(5));
    b.activeExam = exam(t(4));
    expect(mergeStates(a, b, 'local').activeExam?.startedAt).toBe(t(4));
    b.examAttempts.p1 = [{ sitting: 0, startedAt: t(4), submittedAt: t(4), percent: 50, grade: 3, passed: false, questionResults: {}, problemScores: {} }];
    expect(mergeStates(a, b, 'local').activeExam).toBeNull();
  });

  it('is idempotent and symmetric for additive data', () => {
    const a = createInitialState();
    const b = createInitialState();
    a.completedLessons = { [L(0)]: t(1) };
    b.completedLessons = { [L(1)]: t(2) };
    const ab = mergeStates(a, b, 'local');
    expect(serialize(mergeStates(ab, ab, 'local'))).toBe(serialize(ab));
    expect(serialize(mergeStates(b, a, 'local'))).toBe(serialize(ab));
  });
});

describe('hasProgress', () => {
  it('is false for a fresh install and true after any activity', () => {
    const s = createInitialState();
    expect(hasProgress(s)).toBe(false);
    s.notes = { [L(0)]: 'x' };
    expect(hasProgress(s)).toBe(true);
  });
});

describe('syncOnce with one device', () => {
  it('uploads the first copy, then reports unchanged', async () => {
    const cloud = new FakeCloud();
    const d = new Device(cloud);
    d.edit((s) => (s.completedLessons[L(0)] = t(1)));
    expect(await d.sync()).toBe('pushed');
    expect(cloud.doc?.revision).toBe(1);
    expect(await d.sync()).toBe('unchanged');
    expect(cloud.pushes).toBe(1);
  });

  it('pushes again only when something changed', async () => {
    const cloud = new FakeCloud();
    const d = new Device(cloud);
    d.edit((s) => (s.notes[L(0)] = 'hi'));
    await d.sync();
    d.edit((s) => (s.notes[L(0)] = 'hi there'));
    expect(isDirty(d.state, d.base)).toBe(true);
    expect(await d.sync()).toBe('pushed');
    expect(cloud.doc?.revision).toBe(2);
    expect(cloud.doc?.data.notes[L(0)]).toBe('hi there');
  });

  it('retries after a conflict and then succeeds', async () => {
    const cloud = new FakeCloud();
    const d = new Device(cloud);
    d.edit((s) => (s.notes[L(0)] = 'x'));
    cloud.failNextPushWithConflict = 2;
    expect(await d.sync()).toBe('pushed');
  });

  it('gives up with a clear error when conflicts never stop', async () => {
    const cloud = new FakeCloud();
    const d = new Device(cloud);
    d.edit((s) => (s.notes[L(0)] = 'x'));
    cloud.failNextPushWithConflict = 99;
    await expect(d.sync()).rejects.toBeInstanceOf(SyncError);
  });

  it('refuses a corrupted cloud copy instead of adopting it', async () => {
    const cloud = new FakeCloud();
    cloud.doc = { data: { nonsense: true } as unknown as AppState, revision: 3 };
    const d = new Device(cloud);
    await expect(d.sync()).rejects.toMatchObject({ code: 'invalid-remote' });
    expect(cloud.doc.revision).toBe(3);
  });
});

describe('two devices (Mac and the other one)', () => {
  it('a fresh second device adopts the first one’s progress without uploading anything', async () => {
    const cloud = new FakeCloud();
    const a = new Device(cloud);
    a.edit((s) => {
      s.completedLessons[L(0)] = t(1);
      s.settings.weeklyHoursTarget = 20;
    });
    await a.sync();
    const b = new Device(cloud);
    expect(await b.sync()).toBe('pulled');
    expect(b.state.completedLessons[L(0)]).toBe(t(1));
    expect(b.state.settings.weeklyHoursTarget).toBe(20);
    expect(cloud.pushes).toBe(1);
  });

  it('changes flow both ways, including un-ticking a lesson', async () => {
    const cloud = new FakeCloud();
    const a = new Device(cloud);
    a.edit((s) => (s.completedLessons[L(0)] = t(1)));
    await a.sync();
    const b = new Device(cloud);
    await b.sync();

    b.edit((s) => (s.completedLessons[L(1)] = t(2)));
    await b.sync();
    expect(await a.sync()).toBe('pulled');
    expect(Object.keys(a.state.completedLessons).length).toBe(2);

    a.edit((s) => delete s.completedLessons[L(0)]);
    await a.sync();
    expect(await b.sync()).toBe('pulled');
    expect(Object.keys(b.state.completedLessons)).toEqual([L(1)]);
  });

  it('merges when both devices changed things before syncing', async () => {
    const cloud = new FakeCloud();
    const a = new Device(cloud);
    a.edit((s) => (s.completedLessons[L(0)] = t(1)));
    await a.sync();
    const b = new Device(cloud);
    await b.sync();

    a.edit((s) => (s.completedLessons[L(1)] = t(2)));
    b.edit((s) => {
      s.completedLessons[L(2)] = t(3);
      s.sessions.push({ id: 'b1', date: '2026-12-03', category: 'practice', minutes: 45 });
    });
    await a.sync();
    expect(await b.sync()).toBe('merged');
    expect(await a.sync()).toBe('pulled');
    for (const d of [a, b]) {
      expect(Object.keys(d.state.completedLessons).sort()).toEqual([L(0), L(1), L(2)].sort());
      expect(d.state.sessions).toHaveLength(1);
    }
    expect(serialize(a.state)).toBe(serialize(b.state));
  });

  it('first link of a device that already has its own progress merges instead of overwriting', async () => {
    const cloud = new FakeCloud();
    const mac = new Device(cloud);
    mac.edit((s) => (s.completedLessons[L(0)] = t(1)));
    await mac.sync();
    const other = new Device(cloud);
    other.edit((s) => (s.completedLessons[L(5)] = t(2)));
    expect(await other.sync()).toBe('merged');
    expect(Object.keys(other.state.completedLessons).sort()).toEqual([L(0), L(5)].sort());
    await mac.sync();
    expect(Object.keys(mac.state.completedLessons).sort()).toEqual([L(0), L(5)].sort());
  });

  it('an exam started on one device can be continued on the other', async () => {
    const cloud = new FakeCloud();
    const a = new Device(cloud);
    a.edit((s) => (s.completedLessons[L(0)] = t(1)));
    await a.sync();
    const b = new Device(cloud);
    await b.sync();
    a.edit((s) => (s.activeExam = { phaseId: 'p0', sitting: 0, startedAt: t(3), answers: { q1: 2 }, code: {}, orders: {} }));
    await a.sync();
    await b.sync();
    expect(b.state.activeExam?.answers).toEqual({ q1: 2 });
    b.edit((s) => {
      s.examAttempts.p0 = [{ sitting: 0, startedAt: t(3), submittedAt: t(3), percent: 90, grade: 8, passed: true, questionResults: {}, problemScores: {} }];
      s.activeExam = null;
    });
    await b.sync();
    await a.sync();
    expect(a.state.activeExam).toBeNull();
    expect(a.state.examAttempts.p0).toHaveLength(1);
  });

  it('edits made while a sync was in flight are not lost', async () => {
    const cloud = new FakeCloud();
    const a = new Device(cloud);
    a.edit((s) => (s.completedLessons[L(0)] = t(1)));
    await a.sync();
    const b = new Device(cloud);
    await b.sync();
    b.edit((s) => (s.completedLessons[L(1)] = t(2)));
    await b.sync();

    // A starts syncing (it will pull B's change) and the learner ticks another lesson meanwhile.
    const snapshot = serialize(a.state);
    const result = await syncOnce(a.state, a.base, cloud);
    a.edit((s) => (s.completedLessons[L(2)] = t(3)));
    const next = reconcileResult(a.state, snapshot, result)!;
    expect(Object.keys(next.completedLessons).sort()).toEqual([L(0), L(1), L(2)].sort());
  });
});
