import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { lessonExercises } from '../data/exercises';
import { buildExerciseFile, fileNameFor, runsOnlyInApp, stripChecks } from './exerciseFile';

const dir = mkdtempSync(join(tmpdir(), 'lyra-exercise-'));

function runWithNode(source: string, name: string): { code: number; output: string } {
  const file = join(dir, name);
  writeFileSync(file, source);
  try {
    const output = execFileSync(process.execPath, [file], { encoding: 'utf8', timeout: 10_000, stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, output };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, output: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('downloadable VS Code exercise files', () => {
  for (const exercise of lessonExercises.filter((e) => e.language === 'js')) {
    it(`${exercise.id}: the solution passes every check with node`, () => {
      const file = buildExerciseFile(exercise, exercise.solution, { heading: 'test' });
      const result = runWithNode(file, fileNameFor(exercise));
      const local = exercise.tests.filter((t) => !runsOnlyInApp(t.code)).length;
      expect(result.output).toContain(`${local} of ${local} checks passed`);
      expect(result.code).toBe(0);
    });

    it(`${exercise.id}: the starter fails at least one check with node`, () => {
      const file = buildExerciseFile(exercise, exercise.starter, { heading: 'test' });
      expect(runWithNode(file, `starter-${fileNameFor(exercise)}`).code).not.toBe(0);
    });
  }

  it('leaves out the randomised checks, so the file never contains the reference solution', () => {
    for (const exercise of lessonExercises.filter((e) => e.language === 'js')) {
      const file = buildExerciseFile(exercise, exercise.starter, { heading: 'test' });
      expect(file).not.toContain('sameAsRef(');
      expect(file).not.toMatch(/\bref\./);
    }
  });

  it('pasting the whole file back keeps only the learner code', () => {
    const exercise = lessonExercises[0]!;
    const file = buildExerciseFile(exercise, 'function x() {}\n', { heading: 'test' });
    const pasted = stripChecks(file);
    expect(pasted).toContain('function x() {}');
    expect(pasted).not.toContain('const tests = [');
  });
});
