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
import { PROJECT_BREAK_MINUTES, PROJECT_WEIGHT, failedAtQuestions, gradeExam, gradeProject, gradeStageOne } from './grade';

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
            <Clock className="size-3.5" /> {final.project ? `${final.minutes} + ${final.project.minutes} minutes` : `${final.minutes} minutes`}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ListChecks className="size-3.5" /> {final.questions.length} questions
          </span>
          {final.problems.length > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="size-3.5" /> {final.problems.length} coding problem{final.problems.length === 1 ? '' : 's'}
            </span>
          )}
          {final.project && (
            <span className="inline-flex items-center gap-1.5">
              <Code2 className="size-3.5" /> Mini-project
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
            {final.project && (
              <>
                <li>
                  Two parts. <span className="text-fg">Part 1</span>: {final.questions.length} questions in {final.minutes} minutes. <span className="text-fg">Part 2</span>: a mini-project ({final.project.problem.title.replace(/^Mini-project:\s*/i, '')}) in{' '}
                  {final.project.minutes} minutes that uses everything from this phase.
                </li>
                <li>
                  You need {PASS_PERCENT}% in part 1 to unlock the project, and {PASS_PERCENT}% in the project to pass. The grade weighs the questions {Math.round((1 - PROJECT_WEIGHT) * 100)}% and the project {Math.round(PROJECT_WEIGHT * 100)}%; if either part fails, the grade is at most 3.
                </li>
                <li>Between the parts you get a break of up to {PROJECT_BREAK_MINUTES} minutes; the project clock starts by itself when it ends.</li>
              </>
            )}
            <li>One attempt per sitting. Once started, the clock keeps running even if you close the page; when time is up the exam is submitted automatically.</li>
            {!final.project && (
              <li>
                Questions are worth 1 point each and coding problems {PROBLEM_POINTS} points each, with partial credit per test. A problem only earns points if at least one of its example tests passes. You pass with {PASS_PERCENT}% (grade 4).
              </li>
            )}
            {final.project && <li>The project gets partial credit per test, but only if you changed the starter and at least one example test passes.</li>}
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
        You will have {final.minutes} minutes{final.project ? ` for part 1, then ${final.project.minutes} for the project` : ''}. The clock cannot be paused, and this uses your one attempt for the {sittingLabel(unit.sitting).toLowerCase()} sitting.
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
            {sittingLabel(attempt.sitting)} · {fmtDateYear(attempt.submittedAt.slice(0, 10))}
            {final.project ? '' : ` · ${maxPoints} points in total`}
          </p>
          {final.project && attempt.questionPercent !== undefined && (
            <p className="mt-1 text-[13px] text-muted">
              Part 1 questions: <span className={attempt.questionPercent >= PASS_PERCENT ? 'text-success' : 'text-danger'}>{attempt.questionPercent}%</span>
              {' · '}Part 2 project:{' '}
              {attempt.projectPercent === undefined ? (
                <span className="text-subtle">not unlocked</span>
              ) : (
                <span className={attempt.projectPercent >= PASS_PERCENT ? 'text-success' : 'text-danger'}>{attempt.projectPercent}%</span>
              )}
            </p>
          )}
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
          {[...final.problems, ...(final.project && attempt.projectPercent !== undefined ? [final.project.problem] : [])].map((p) => {
            const score = attempt.problemScores[p.id] ?? 0;
            const isProject = p.id === final.project?.problem.id;
            return (
              <li key={p.id} className="flex gap-3 px-4 py-3 text-[13px]">
                {score === 1 ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-danger" />}
                <div className="min-w-0 flex-1">
                  <p className="text-subtle">{isProject ? 'Part 2 · project' : 'Coding problem'}</p>
                  <p className="text-fg">{p.title}</p>
                  {reveal && isProject && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-accent">Reference solution</summary>
                      <pre className="mt-2 overflow-x-auto rounded-lg border border-line bg-bg px-3 py-2.5 font-mono text-[12px] text-muted">{p.solution}</pre>
                    </details>
                  )}
                </div>
                <span className="shrink-0 tabular-nums text-muted">
                  {isProject ? `${Math.round(score * 100)}% of tests` : `${Math.round(score * 100)}% of tests · ${(score * PROBLEM_POINTS).toFixed(1)}/${PROBLEM_POINTS} pts`}
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
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  let stage = active.stage ?? 'questions';
  // The break ends by itself: the project clock starts when it runs out.
  if (stage === 'project-ready' && active.projectStartedAt && now >= Date.parse(active.projectStartedAt)) stage = 'project';

  if (stage === 'project-ready') return <ProjectBreak phase={phase} final={final} active={active} now={now} />;
  if (stage === 'project' && final.project) return <ProjectStage key="project" phase={phase} final={final} active={active} now={now} />;
  return <QuestionsStage key="questions" phase={phase} final={final} active={active} now={now} />;
}

function ExamBar({ phase, active, label, remaining, onSubmit, disabled }: { phase: Phase; active: ActiveExam; label?: string; remaining?: number; onSubmit?: () => void; disabled?: boolean }) {
  const lowTime = remaining !== undefined && remaining < 5 * 60_000;
  return (
    <div className="sticky top-14 z-10 -mx-4 mb-6 flex items-center justify-between gap-3 border-b border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 md:top-0 lg:-mx-10 lg:px-10">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-medium">Phase {phase.number} final · {phase.title}</p>
        <p className="text-[12px] text-subtle">
          {sittingLabel(active.sitting)}
          {label ? ` · ${label}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {remaining !== undefined && (
          <span className={cx('inline-flex items-center gap-1.5 font-mono text-lg tabular-nums', lowTime ? 'text-danger' : 'text-fg')} aria-live="off" aria-label="Time remaining">
            <AlarmClock className="size-4" /> {formatClock(remaining)}
          </span>
        )}
        {onSubmit && (
          <Button variant="primary" size="sm" onClick={onSubmit} disabled={disabled}>
            <Send className="size-4" /> Submit
          </Button>
        )}
      </div>
    </div>
  );
}

function Grading({ what }: { what: string }) {
  return (
    <Panel className="flex items-center gap-3 p-6">
      <Loader2 className="size-5 animate-spin text-accent" />
      <div>
        <p className="font-medium">Grading {what}…</p>
        <p className="text-[13px] text-muted">Running your code against every test, including the hidden ones.</p>
      </div>
    </Panel>
  );
}

/** Submits once, either from the button or when time runs out. */
function useSubmitOnce(remaining: number, submit: () => Promise<void>) {
  const submitted = useRef(false);
  const [grading, setGrading] = useState(false);
  const run = useCallback(async () => {
    if (submitted.current) return;
    submitted.current = true;
    setGrading(true);
    await submit();
    window.scrollTo({ top: 0 });
  }, [submit]);
  useEffect(() => {
    if (remaining <= 0) void run();
  }, [remaining, run]);
  return { grading, run };
}

function QuestionsStage({ phase, final, active, now }: { phase: Phase; final: FinalExam; active: ActiveExam; now: number }) {
  const { dispatch } = useAppState();
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  // Latest code typed in each problem, ahead of the debounced save.
  const codeRef = useRef<Record<string, string>>({});
  const remaining = Date.parse(active.startedAt) + final.minutes * 60_000 - now;

  const submit = useCallback(async () => {
    setConfirmSubmit(false);
    const latest = { ...activeRef.current, code: { ...activeRef.current.code, ...codeRef.current } };
    if (!final.project) {
      dispatch({ type: 'finishExam', phaseId: phase.id, attempt: await gradeExam(final, latest) });
      return;
    }
    const result = await gradeStageOne(final, latest);
    if (result.percent < PASS_PERCENT) {
      dispatch({ type: 'finishExam', phaseId: phase.id, attempt: failedAtQuestions(latest, result) });
      return;
    }
    dispatch({
      type: 'updateActiveExam',
      changes: {
        stage: 'project-ready',
        questionPercent: result.percent,
        questionResults: result.questionResults,
        problemScores: result.problemScores,
        projectStartedAt: new Date(Date.now() + PROJECT_BREAK_MINUTES * 60_000).toISOString(),
      },
    });
  }, [dispatch, final, phase.id]);
  const { grading, run } = useSubmitOnce(remaining, submit);

  const unanswered = final.questions.filter((q) => !isAnswered(q, active.answers[q.id])).length;

  return (
    <>
      <ExamBar phase={phase} active={active} label={final.project ? 'Part 1 of 2 · Questions' : undefined} remaining={remaining} onSubmit={() => setConfirmSubmit(true)} disabled={grading} />

      {grading ? (
        <Grading what={final.project ? 'part 1' : 'your exam'} />
      ) : (
        <>
          {final.project && (
            <p className="mb-6 rounded-lg border border-line bg-surface-2 px-4 py-3 text-[13px] text-muted">
              Part 1 of 2. You need {PASS_PERCENT}% here to unlock the {final.project.minutes}-minute mini-project. Both parts must pass.
            </p>
          )}
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
              <Send className="size-4" /> {final.project ? 'Submit part 1' : 'Submit exam'}
            </Button>
          </div>
        </>
      )}

      <ConfirmDialog
        open={confirmSubmit}
        title={final.project ? 'Submit part 1?' : 'Submit your exam?'}
        confirmLabel="Submit"
        onConfirm={() => {
          setConfirmSubmit(false);
          void run();
        }}
        onCancel={() => setConfirmSubmit(false)}
      >
        {unanswered > 0 ? `${unanswered} question${unanswered === 1 ? ' is' : 's are'} still unanswered. ` : ''}
        You cannot change anything after submitting. {formatClock(remaining)} left.
      </ConfirmDialog>
    </>
  );
}

function ProjectBreak({ phase, final, active, now }: { phase: Phase; final: FinalExam; active: ActiveExam; now: number }) {
  const { dispatch } = useAppState();
  const project = final.project!;
  const breakLeft = active.projectStartedAt ? Date.parse(active.projectStartedAt) - now : 0;
  const start = () => {
    dispatch({ type: 'updateActiveExam', changes: { stage: 'project', projectStartedAt: new Date().toISOString() } });
    window.scrollTo({ top: 0 });
  };
  return (
    <>
      <ExamBar phase={phase} active={active} label="Break before part 2" />
      <Panel className="flex flex-col gap-4 border-success/30 p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="size-6 shrink-0 text-success" />
          <div>
            <p className="font-medium text-success">Part 1 passed · {active.questionPercent ?? 0}%</p>
            <p className="text-[13px] text-muted">Your answers are locked. Which ones were right is shown once the whole exam is graded.</p>
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface-2 px-4 py-3 text-[13px] text-muted">
          <p className="font-medium text-fg">Part 2 · {project.problem.title}</p>
          <p className="mt-1">
            A small program that uses everything from this phase. You get {project.minutes} minutes and can run the example tests as often as you like; hidden tests grade it when you submit. It is worth{' '}
            {Math.round(PROJECT_WEIGHT * 100)}% of the final grade and needs {PASS_PERCENT}% on its own.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-muted">
            Take a short break if you need one. The project clock starts by itself in <span className="font-mono tabular-nums text-fg">{formatClock(breakLeft)}</span>.
          </p>
          <Button variant="primary" className="h-10 px-5" onClick={start}>
            <Play className="size-4" /> Start the project
          </Button>
        </div>
      </Panel>
    </>
  );
}

function ProjectStage({ phase, final, active, now }: { phase: Phase; final: FinalExam; active: ActiveExam; now: number }) {
  const { dispatch } = useAppState();
  const project = final.project!;
  const problem = project.problem;
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const activeRef = useRef(active);
  activeRef.current = active;
  const codeRef = useRef<string | null>(null);
  const started = Date.parse(active.projectStartedAt ?? active.startedAt);
  const remaining = started + project.minutes * 60_000 - now;

  const submit = useCallback(async () => {
    setConfirmSubmit(false);
    const current = activeRef.current;
    const latest = codeRef.current === null ? current : { ...current, code: { ...current.code, [problem.id]: codeRef.current } };
    dispatch({ type: 'finishExam', phaseId: phase.id, attempt: await gradeProject(final, latest) });
  }, [dispatch, final, phase.id, problem.id]);
  const { grading, run } = useSubmitOnce(remaining, submit);

  return (
    <>
      <ExamBar phase={phase} active={active} label="Part 2 of 2 · Project" remaining={remaining} onSubmit={() => setConfirmSubmit(true)} disabled={grading} />
      {grading ? (
        <Grading what="your project" />
      ) : (
        <>
          <ExamProblem
            problem={problem}
            index={0}
            initialCode={active.code[problem.id] ?? problem.starter}
            onCode={(code) => {
              codeRef.current = code;
            }}
            onSave={(code) => dispatch({ type: 'updateExamCode', problemId: problem.id, code })}
          />
          <div className="mt-6 flex justify-end">
            <Button variant="primary" onClick={() => setConfirmSubmit(true)}>
              <Send className="size-4" /> Submit project
            </Button>
          </div>
        </>
      )}
      <ConfirmDialog
        open={confirmSubmit}
        title="Submit your project?"
        confirmLabel="Submit"
        onConfirm={() => {
          setConfirmSubmit(false);
          void run();
        }}
        onCancel={() => setConfirmSubmit(false)}
      >
        It will be graded with the hidden tests and the exam will be closed. {formatClock(remaining)} left.
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
