import { useCallback, useEffect, useRef, useState } from 'react';
import { AlarmClock, CheckCircle2, Clock, Code2, ListChecks, Loader2, Play, Send, Terminal, XCircle } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { RichText } from '../../components/RichText';
import { Badge, Button, EmptyState, Panel, SectionTitle, buttonClass, cx } from '../../components/ui';
import { getPhase } from '../../data/curriculum';
import { getFinal } from '../../data/finals';
import { useAppState } from '../../hooks/useAppState';
import { checkpointHref, examHref, lessonHref } from '../../hooks/useHashRoute';
import { PASS_PERCENT, PROBLEM_POINTS, formatCountdown, getUnitExam, sittingLabel } from '../../lib/exams';
import { isAnswered, shuffledIndexes } from '../../lib/quiz';
import { runProblem } from '../../lib/runner';
import type { CodeProblem, FinalExam, RunReport } from '../../types/checkpoint';
import type { Phase } from '../../types/curriculum';
import type { ActiveExam, ExamAttempt } from '../../types/state';
import { CodeEditor } from '../checkpoints/CodeEditor';
import { QuestionCard } from '../checkpoints/QuestionCard';
import { fmtDate, fmtDateYear } from './dates';
import { gradeExam } from './grade';

export function ExamPage({ phaseId }: { phaseId: string }) {
  const { state } = useAppState();
  const phase = getPhase(phaseId);
  const final = getFinal(phaseId);

  if (!phase || !final) {
    return (
      <EmptyState
        title="Exam not found"
        action={
          <a href="#/exams" className={buttonClass('secondary')}>
            All finals
          </a>
        }
      />
    );
  }
  if (!state.examPlan) {
    return (
      <EmptyState
        title="Set up your exam calendar first"
        description="Finals have deadlines, so the app needs your pace and start date."
        action={
          <a href="#/exams" className={buttonClass('primary')}>
            Set up finals
          </a>
        }
      />
    );
  }
  if (state.activeExam?.phaseId === phaseId) return <ExamRunner key={state.activeExam.startedAt} phase={phase} final={final} active={state.activeExam} />;
  return <ExamSheet phase={phase} final={final} />;
}

// ---------- Before / after the exam ----------

function ExamSheet({ phase, final }: { phase: Phase; final: FinalExam }) {
  const { state, dispatch } = useAppState();
  const unit = getUnitExam(state, phase.id);
  const [confirmStart, setConfirmStart] = useState(false);
  if (!unit) return null;

  const otherActive = state.activeExam && state.activeExam.phaseId !== phase.id ? getPhase(state.activeExam.phaseId) : null;
  const lastAttempt = unit.attempts[unit.attempts.length - 1];
  const maxPoints = final.questions.length + final.problems.length * PROBLEM_POINTS;

  const start = () => {
    const orders: Record<string, number[]> = {};
    for (const q of final.questions) if (q.kind !== 'text') orders[q.id] = shuffledIndexes(q.options.length);
    dispatch({
      type: 'startExam',
      exam: { phaseId: phase.id, sitting: unit.sitting, startedAt: new Date().toISOString(), answers: {}, code: {}, orders },
    });
    setConfirmStart(false);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <nav className="mb-4 flex items-center gap-1.5 text-[13px] text-muted" aria-label="Breadcrumb">
        <a href="#/exams" className="hover:text-fg">
          Finals
        </a>
        <span className="text-subtle">/</span>
        <span className="truncate">Phase {phase.number}</span>
      </nav>

      <header className="mb-6">
        <p className="text-[13px] font-medium text-accent">Phase {phase.number} final exam</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{phase.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" /> {final.minutes} minutes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-3.5" /> {final.questions.length} questions
          </span>
          {final.problems.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="size-3.5" /> {final.problems.length} coding problem{final.problems.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </header>

      {unit.status === 'passed' && unit.passedAttempt ? (
        <Panel className="mb-6 flex items-center gap-5 border-success/40 p-5">
          <GradeBadge attempt={unit.passedAttempt} />
          <div>
            <p className="font-medium text-success">Passed</p>
            <p className="text-[13px] text-muted">
              {sittingLabel(unit.passedAttempt.sitting)} · {fmtDateYear(unit.passedAttempt.submittedAt.slice(0, 10))} · {unit.passedAttempt.percent}%
            </p>
          </div>
        </Panel>
      ) : (
        <Panel className={cx('mb-6 p-5', unit.daysLeft < 3 && unit.status !== 'not-eligible' && 'border-accent/40')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[12px] text-subtle">{sittingLabel(unit.sitting)}</p>
              <p className="mt-0.5 text-lg font-semibold">
                Deadline {fmtDateYear(unit.deadline)} <span className="text-[13px] font-normal text-muted">· {formatCountdown(unit.daysLeft)}</span>
              </p>
              {unit.sitting === 1 && <p className="mt-1 text-[13px] text-muted">This is your retake. If you do not pass it, the phase goes libre and the calendar moves back a week.</p>}
              {unit.sitting >= 2 && <p className="mt-1 text-[13px] text-muted">This phase is libre. A new sitting opens every week until you pass; later deadlines have moved back.</p>}
            </div>
            {unit.status === 'available' && !otherActive && (
              <Button variant="primary" className="h-10 px-5" onClick={() => setConfirmStart(true)}>
                <Play className="size-4" /> Start the exam
              </Button>
            )}
          </div>

          {otherActive && (
            <p className="mt-4 text-[13px] text-muted">
              You have the{' '}
              <a href={examHref(otherActive.id)} className="text-accent">
                Phase {otherActive.number} final
              </a>{' '}
              in progress. Finish it first.
            </p>
          )}
          {unit.status === 'cooldown' && unit.availableFrom && (
            <p className="mt-4 text-[13px] text-muted">The next sitting opens {fmtDate(unit.availableFrom)}. Use today to review what went wrong.</p>
          )}
          {unit.status === 'not-eligible' && (
            <div className="mt-4 text-[13px]">
              <p className="font-medium text-fg">Before you can sit this exam:</p>
              <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-muted marker:text-subtle">
                {unit.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={checkpointHref(phase.id)} className={buttonClass('secondary', 'sm')}>
                  Phase checkpoint
                </a>
              </div>
            </div>
          )}
        </Panel>
      )}

      {unit.status !== 'passed' && (
        <section className="mb-6">
          <SectionTitle>Rules</SectionTitle>
          <ul className="flex list-disc flex-col gap-1 pl-5 text-[13px] text-muted marker:text-subtle">
            <li>One attempt per sitting. Once started, the clock keeps running even if you close the page; when time is up the exam is submitted automatically.</li>
            <li>
              Questions are worth 1 point each and coding problems {PROBLEM_POINTS} points each, with partial credit per test. A problem only earns points if at least one of its example tests passes. You pass with {PASS_PERCENT}% (grade 4).
            </li>
            <li>During the exam, "Run examples" only runs the example tests. Your code is graded with additional hidden tests when you submit.</li>
            <li>No hints, no reference solutions. You may use the official documentation, as in an open-book exam.</li>
            <li>Correct answers are only revealed once you pass.</li>
          </ul>
        </section>
      )}

      {lastAttempt && <AttemptResults phase={phase} final={final} attempt={lastAttempt} maxPoints={maxPoints} reveal={Boolean(unit.passedAttempt)} />}

      {unit.attempts.length > 1 && (
        <section className="mt-6">
          <SectionTitle>All attempts</SectionTitle>
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-line">
              {unit.attempts.map((a, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                  <span>
                    {sittingLabel(a.sitting)} <span className="text-subtle">· {fmtDate(a.submittedAt.slice(0, 10))}</span>
                  </span>
                  <span className={a.passed ? 'text-success' : 'text-danger'}>
                    {a.grade} ({a.percent}%)
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      )}

      <ConfirmDialog open={confirmStart} title="Start the exam now?" confirmLabel="Start" onConfirm={start} onCancel={() => setConfirmStart(false)}>
        You will have {final.minutes} minutes. The clock cannot be paused, and this uses your one attempt for the {sittingLabel(unit.sitting).toLowerCase()} sitting.
      </ConfirmDialog>
    </>
  );
}

function GradeBadge({ attempt }: { attempt: ExamAttempt }) {
  return (
    <div
      className={cx(
        'grid size-16 shrink-0 place-items-center rounded-2xl border text-3xl font-semibold tabular-nums',
        attempt.passed ? 'border-success/40 bg-success/10 text-success' : 'border-danger/40 bg-danger-soft text-danger',
      )}
      aria-label={`Grade ${attempt.grade}`}
    >
      {attempt.grade}
    </div>
  );
}

function AttemptResults({ phase, final, attempt, maxPoints, reveal }: { phase: Phase; final: FinalExam; attempt: ExamAttempt; maxPoints: number; reveal: boolean }) {
  return (
    <section>
      <SectionTitle>Latest result</SectionTitle>
      <Panel className={cx('mb-4 flex items-center gap-5 p-5', attempt.passed ? 'border-success/30' : 'border-danger/30')}>
        <GradeBadge attempt={attempt} />
        <div>
          <p className={cx('font-medium', attempt.passed ? 'text-success' : 'text-danger')}>
            {attempt.passed ? 'Passed' : 'Not passed'} · {attempt.percent}%
          </p>
          <p className="text-[13px] text-muted">
            {sittingLabel(attempt.sitting)} · {fmtDateYear(attempt.submittedAt.slice(0, 10))} · {maxPoints} points in total
          </p>
        </div>
      </Panel>
      <Panel className="overflow-hidden">
        <ul className="divide-y divide-line">
          {final.questions.map((q, i) => {
            const ok = attempt.questionResults[q.id];
            const lesson = q.lesson ? phase.lessons[q.lesson - 1] : undefined;
            return (
              <li key={q.id} className="flex gap-3 px-4 py-3 text-[13px]">
                {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />}
                <div className="min-w-0 flex-1">
                  <p className="text-subtle">Question {i + 1}</p>
                  <RichText text={q.prompt} className="text-fg" />
                  {reveal && <RichText text={q.explanation} className="mt-1 text-muted" />}
                  {!ok && lesson && (
                    <a href={lessonHref(lesson.id)} className="mt-1 inline-block text-accent hover:text-accent-strong">
                      Review Lesson {lesson.number}: {lesson.title}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
          {final.problems.map((p) => {
            const score = attempt.problemScores[p.id] ?? 0;
            return (
              <li key={p.id} className="flex gap-3 px-4 py-3 text-[13px]">
                {score === 1 ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />}
                <div className="min-w-0 flex-1">
                  <p className="text-subtle">Coding problem</p>
                  <p className="text-fg">{p.title}</p>
                </div>
                <span className="shrink-0 tabular-nums text-muted">
                  {Math.round(score * 100)}% of tests · {(score * PROBLEM_POINTS).toFixed(1)}/{PROBLEM_POINTS} pts
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>
    </section>
  );
}

// ---------- During the exam ----------

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function ExamRunner({ phase, final, active }: { phase: Phase; final: FinalExam; active: ActiveExam }) {
  const { dispatch } = useAppState();
  const endAt = Date.parse(active.startedAt) + final.minutes * 60_000;
  const [now, setNow] = useState(() => Date.now());
  const [grading, setGrading] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const submitted = useRef(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  // Latest code typed in each problem, ahead of the debounced save.
  const codeRef = useRef<Record<string, string>>({});

  const submit = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setConfirmSubmit(false);
    setGrading(true);
    const latest = { ...activeRef.current, code: { ...activeRef.current.code, ...codeRef.current } };
    const attempt = await gradeExam(final, latest);
    dispatch({ type: 'finishExam', phaseId: phase.id, attempt });
    window.scrollTo({ top: 0 });
  }, [dispatch, final, phase.id]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const remaining = endAt - now;
  useEffect(() => {
    if (remaining <= 0) void submit();
  }, [remaining, submit]);

  const unanswered = final.questions.filter((q) => !isAnswered(q, active.answers[q.id])).length;
  const lowTime = remaining < 5 * 60_000;

  return (
    <>
      <div className="sticky top-14 z-10 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-0 lg:-mx-10 lg:px-10">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium">Phase {phase.number} final · {phase.title}</p>
          <p className="text-[12px] text-subtle">{sittingLabel(active.sitting)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={cx('inline-flex items-center gap-1.5 font-mono text-lg tabular-nums', lowTime ? 'text-danger' : 'text-fg')} aria-live="off" aria-label="Time remaining">
            <AlarmClock className="size-4" /> {formatClock(remaining)}
          </span>
          <Button variant="primary" size="sm" onClick={() => setConfirmSubmit(true)} disabled={grading}>
            <Send className="size-4" /> Submit
          </Button>
        </div>
      </div>

      {grading ? (
        <Panel className="flex items-center gap-3 p-6">
          <Loader2 className="size-5 animate-spin text-accent" />
          <div>
            <p className="font-medium">Grading your exam…</p>
            <p className="text-[13px] text-muted">Running your code against every test, including the hidden ones.</p>
          </div>
        </Panel>
      ) : (
        <>
          <section className="mb-8">
            <SectionTitle>Questions · 1 point each</SectionTitle>
            <ol className="flex flex-col gap-3">
              {final.questions.map((q, i) => (
                <li key={q.id}>
                  <QuestionCard
                    question={q}
                    index={i}
                    answer={active.answers[q.id]}
                    order={active.orders[q.id] ?? ('options' in q ? q.options.map((_, j) => j) : [])}
                    onAnswer={(a) => dispatch({ type: 'updateExamAnswer', questionId: q.id, answer: a ?? null })}
                  />
                </li>
              ))}
            </ol>
          </section>

          {final.problems.length > 0 && (
            <section className="mb-8">
              <SectionTitle>Coding problems · {PROBLEM_POINTS} points each</SectionTitle>
              <div className="flex flex-col gap-4">
                {final.problems.map((p, i) => (
                  <ExamProblem
                    key={p.id}
                    problem={p}
                    index={i}
                    initialCode={active.code[p.id] ?? p.starter}
                    onCode={(code) => {
                      codeRef.current[p.id] = code;
                    }}
                    onSave={(code) => dispatch({ type: 'updateExamCode', problemId: p.id, code })}
                  />
                ))}
              </div>
            </section>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={() => setConfirmSubmit(true)}>
              <Send className="size-4" /> Submit exam
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog open={confirmSubmit} title="Submit your exam?" confirmLabel="Submit" onConfirm={() => void submit()} onCancel={() => setConfirmSubmit(false)}>
        {unanswered > 0 ? `${unanswered} question${unanswered === 1 ? ' is' : 's are'} still unanswered. ` : ''}
        You cannot change anything after submitting. {formatClock(remaining)} left.
      </ConfirmDialog>
    </>
  );
}

const SAVE_DELAY = 500;

function ExamProblem({
  problem,
  index,
  initialCode,
  onCode,
  onSave,
}: {
  problem: CodeProblem;
  index: number;
  initialCode: string;
  onCode: (code: string) => void;
  onSave: (code: string) => void;
}) {
  const [code, setCode] = useState(initialCode);
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<RunReport | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef(initialCode);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      onSave(latest.current);
    },
    // Save once on unmount with the latest code.
    [],
  );

  const change = (value: string) => {
    setCode(value);
    latest.current = value;
    onCode(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => onSave(value), SAVE_DELAY);
  };

  const run = async () => {
    if (running) return;
    setRunning(true);
    try {
      setReport(await runProblem(problem, code, { includeHidden: false }));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Panel className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <span className="font-medium">
          <span className="text-subtle">{index + 1}. </span>
          {problem.title}
        </span>
        <Badge tone="accent">{problem.language.toUpperCase()}</Badge>
      </div>
      <RichText text={problem.prompt} className="text-[14px] text-muted" />
      <CodeEditor value={code} onChange={change} onRun={run} label={`Code for ${problem.title}`} />
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={run} disabled={running}>
          {running ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          {running ? 'Running…' : 'Run examples'}
        </Button>
        <span className="text-[12px] text-subtle">Only the example tests run now. Hidden tests run when you submit.</span>
      </div>
      {report && (
        <div className="flex flex-col gap-2">
          {report.error && !report.results.length && <pre className="whitespace-pre-wrap font-mono text-[12px] text-danger">{report.error}</pre>}
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
                        <td key={j} className="px-3 py-1.5">
                          {v === null ? 'NULL' : String(v)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {report.logs.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-[12px] text-subtle">
                <Terminal className="size-3.5" /> Console output
              </p>
              <pre className="max-h-40 overflow-auto rounded-lg border border-line bg-bg px-3 py-2 font-mono text-[12px] text-muted">{report.logs.join('\n')}</pre>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
