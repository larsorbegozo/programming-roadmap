import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, Circle, Lightbulb, Loader2, Play, RotateCcw, Terminal, XCircle } from 'lucide-react';
import { RichText } from '../../components/RichText';
import { Badge, Button, cx } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { lessonHref } from '../../hooks/useHashRoute';
import { runProblem } from '../../lib/runner';
import type { Phase } from '../../types/curriculum';
import type { CodeLanguage, CodeProblem, RunReport } from '../../types/checkpoint';
import { CodeEditor } from './CodeEditor';

const LANGUAGE_LABEL: Record<CodeLanguage, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  jsx: 'React',
  rn: 'React Native',
  sql: 'SQL',
};

const SAVE_DELAY = 600;

interface ProblemCardProps {
  phase: Phase;
  problem: CodeProblem;
  index: number;
  open: boolean;
  onToggle: () => void;
}

export function ProblemCard({ phase, problem, index, open, onToggle }: ProblemCardProps) {
  const { state, dispatch } = useAppState();
  const saved = state.checkpoints[phase.id]?.problems[problem.id];
  const passed = Boolean(saved?.passedAt);
  const [code, setCode] = useState(saved?.code ?? problem.starter);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<RunReport | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [confirmReset, setConfirmReset] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef<string | null>(null);
  const lesson = problem.lesson ? phase.lessons[problem.lesson - 1] : undefined;
  const hints = problem.hints ?? [];
  const slowFirstRun = problem.language !== 'js' && problem.language !== 'sql';

  const flush = () => {
    window.clearTimeout(timer.current);
    if (pending.current !== null) {
      dispatch({ type: 'saveProblemCode', phaseId: phase.id, problemId: problem.id, code: pending.current });
      pending.current = null;
    }
  };

  // Save any pending edit when the card unmounts.
  useEffect(() => flush, []);

  const onChange = (value: string) => {
    setCode(value);
    pending.current = value;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, SAVE_DELAY);
  };

  const run = async () => {
    if (running) return;
    flush();
    setRunning(true);
    try {
      const result = await runProblem(problem, code);
      setReport(result);
      if (result.passed) dispatch({ type: 'markProblemPassed', phaseId: phase.id, problemId: problem.id, code });
    } finally {
      setRunning(false);
    }
  };

  const reset = () => {
    onChange(problem.starter);
    setReport(null);
    setConfirmReset(false);
  };

  const passedCount = report?.results.filter((r) => r.passed).length ?? 0;

  return (
    <article className={cx('overflow-hidden rounded-xl border bg-surface', passed ? 'border-success/30' : 'border-line')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-surface-2 sm:px-5">
        {passed ? <CheckCircle2 className="size-5 shrink-0 text-success" /> : <Circle className="size-5 shrink-0 text-line-strong" />}
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-fg">
            <span className="text-subtle">{index + 1}. </span>
            {problem.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-2">
            <Badge tone="accent">{LANGUAGE_LABEL[problem.language]}</Badge>
            {lesson && <span className="text-[11px] text-subtle">Lesson {lesson.number}</span>}
            {passed && <Badge tone="success">Solved</Badge>}
          </span>
        </span>
        <ChevronDown className={cx('size-4 shrink-0 text-subtle transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="flex flex-col gap-4 border-t border-line p-4 sm:p-5">
          <RichText text={problem.prompt} className="text-[14px] text-muted" />

          <CodeEditor value={code} onChange={onChange} onRun={run} label={`Code for ${problem.title}`} />

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="primary" onClick={run} disabled={running}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {running ? 'Running…' : 'Run tests'}
            </Button>
            {hints.length > 0 && hintsShown < hints.length && (
              <Button variant="ghost" onClick={() => setHintsShown((n) => n + 1)}>
                <Lightbulb className="size-4" /> {hintsShown === 0 ? 'Show a hint' : 'Another hint'}
              </Button>
            )}
            {confirmReset ? (
              <span className="flex items-center gap-2 text-[13px] text-muted">
                Replace your code with the starter?
                <Button size="sm" variant="danger" onClick={reset}>
                  Reset
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                  Cancel
                </Button>
              </span>
            ) : (
              <Button variant="ghost" onClick={() => setConfirmReset(true)} disabled={code === problem.starter}>
                <RotateCcw className="size-4" /> Reset
              </Button>
            )}
            <span className="ml-auto hidden text-[12px] text-subtle sm:inline">Ctrl / ⌘ + Enter runs the tests</span>
          </div>
          {running && slowFirstRun && <p className="text-[12px] text-subtle">The first run loads the TypeScript compiler, which can take a few seconds.</p>}

          {hintsShown > 0 && (
            <ul className="flex flex-col gap-2">
              {hints.slice(0, hintsShown).map((hint, i) => (
                <li key={i} className="flex gap-2 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] text-muted">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
                  <RichText text={hint} />
                </li>
              ))}
            </ul>
          )}

          {report && (
            <section aria-live="polite" className="flex flex-col gap-3">
              <p className={cx('font-medium', report.passed ? 'text-success' : 'text-danger')}>
                {report.passed ? 'All tests passed. Problem solved.' : `${passedCount} of ${report.results.length} tests passed`}
              </p>
              {report.error && !report.results.length && (
                <pre className="whitespace-pre-wrap rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 font-mono text-[12px] text-danger">{report.error}</pre>
              )}
              <ul className="flex flex-col gap-1.5">
                {report.results.map((r, i) => (
                  <li key={i} className="flex gap-2.5 text-[13px]">
                    {r.passed ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />}
                    <span className="min-w-0">
                      <span className={r.passed ? 'text-muted' : 'text-fg'}>{r.name}</span>
                      {!r.passed && r.message && <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[12px] text-danger/90">{r.message}</pre>}
                    </span>
                  </li>
                ))}
              </ul>

              {report.table && report.table.columns.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[12px] text-subtle">Your query returned:</p>
                  <div className="overflow-x-auto rounded-lg border border-line">
                    <table className="w-full text-left font-mono text-[12px]">
                      <thead className="bg-surface-2 text-subtle">
                        <tr>
                          {report.table.columns.map((c, i) => (
                            <th key={i} className="px-3 py-1.5 font-medium">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-line">
                        {report.table.rows.map((row, i) => (
                          <tr key={i}>
                            {row.map((v, j) => (
                              <td key={j} className="px-3 py-1.5 text-fg">
                                {v === null ? 'NULL' : String(v)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {report.logs.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[12px] text-subtle">
                    <Terminal className="size-3.5" /> Console output
                  </p>
                  <pre className="max-h-48 overflow-auto rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[12px] text-muted">{report.logs.join('\n')}</pre>
                </div>
              )}
            </section>
          )}

          {passed && (
            <div>
              <button type="button" onClick={() => setShowSolution((v) => !v)} className="text-[13px] text-accent hover:text-accent-strong">
                {showSolution ? 'Hide' : 'Compare with'} the reference solution
              </button>
              {showSolution && (
                <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-muted">{problem.solution}</pre>
              )}
            </div>
          )}

          {!passed && lesson && (
            <p className="text-[12px] text-subtle">
              Stuck? Re-read{' '}
              <a href={lessonHref(lesson.id)} className="text-accent hover:text-accent-strong">
                Lesson {lesson.number}: {lesson.title}
              </a>
              , use the hints, or ask Claude Code to explain the error message (not to write the solution).
            </p>
          )}
        </div>
      )}
    </article>
  );
}
