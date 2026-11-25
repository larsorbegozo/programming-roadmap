import { useState } from 'react';
import { ArrowRight, Award, Code2, ListChecks } from 'lucide-react';
import { EmptyState, Panel, SegmentedControl, buttonClass, cx } from '../../components/ui';
import { getCheckpoint } from '../../data/checkpoints';
import { curriculum, getPhase } from '../../data/curriculum';
import { useAppState } from '../../hooks/useAppState';
import { lessonHref, phaseHref } from '../../hooks/useHashRoute';
import { QUIZ_PASS_PERCENT, getCheckpointStatus, getPhaseProgress } from '../../lib/progress';
import { ProblemCard } from './ProblemCard';
import { QuizSection } from './QuizSection';

type Tab = 'questions' | 'problems';

export function CheckpointPage({ phaseId }: { phaseId: string }) {
  const { state } = useAppState();
  const phase = getPhase(phaseId);
  const checkpoint = getCheckpoint(phaseId);
  const status = getCheckpointStatus(state, phaseId);
  const [tab, setTab] = useState<Tab>(() => (status.quizPassed && (checkpoint?.problems.length ?? 0) > 0 ? 'problems' : 'questions'));
  const [openProblem, setOpenProblem] = useState<string | null>(() => {
    const cp = state.checkpoints[phaseId];
    return checkpoint?.problems.find((p) => !cp?.problems[p.id]?.passedAt)?.id ?? null;
  });

  if (!phase || !checkpoint) {
    return (
      <EmptyState
        title="Checkpoint not found"
        description="This phase has no checkpoint. It may have been a broken link."
        action={
          <a href="#/roadmap" className={buttonClass('secondary')}>
            Back to roadmap
          </a>
        }
      />
    );
  }

  const progress = getPhaseProgress(state, phase);
  const lessonsLeft = progress.lessonsTotal - progress.lessonsCompleted;
  const nextPhase = curriculum[phase.number + 1];
  const firstOpenLesson = phase.lessons.find((l) => !state.completedLessons[l.id]);
  const hasProblems = checkpoint.problems.length > 0;
  const hasQuestions = checkpoint.questions.length > 0;
  const activeTab: Tab = !hasProblems ? 'questions' : !hasQuestions ? 'problems' : tab;

  return (
    <>
      <nav className="mb-4 flex min-w-0 items-center gap-1.5 text-[13px] text-muted" aria-label="Breadcrumb">
        <a href="#/roadmap" className="hover:text-fg">
          Roadmap
        </a>
        <span className="text-subtle">/</span>
        <a href={phaseHref(phase.id)} className="truncate hover:text-fg">
          Phase {phase.number}: {phase.title}
        </a>
      </nav>

      <header className="mb-6">
        <p className="text-[13px] font-medium text-accent">Phase {phase.number} checkpoint</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Check your understanding: {phase.title}</h1>
        <p className="mt-2 max-w-2xl text-muted">
          {hasQuestions && `Score at least ${QUIZ_PASS_PERCENT}% on the questions`}
          {hasQuestions && hasProblems && ' and '}
          {hasProblems && 'solve every coding problem (your code runs against real tests)'}. You can retry as often as you like. The phase counts as
          completed when this checkpoint is passed and all its lessons are done.
        </p>
      </header>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {hasQuestions && (
          <Panel as="div" className={cx('p-4', status.quizPassed && 'border-success/30')}>
            <p className="flex items-center gap-2 text-[12px] text-subtle">
              <ListChecks className="size-3.5" /> Questions
            </p>
            <p className={cx('mt-1.5 text-xl font-semibold tabular-nums', status.quizPassed && 'text-success')}>
              {status.bestScore === null ? 'Not taken' : `${status.bestScore}%`}
            </p>
            <p className="text-[12px] text-muted">{status.quizPassed ? 'Passed' : `${QUIZ_PASS_PERCENT}% needed`}</p>
          </Panel>
        )}
        {hasProblems && (
          <Panel as="div" className={cx('p-4', status.problemsPassed === status.problemsTotal && 'border-success/30')}>
            <p className="flex items-center gap-2 text-[12px] text-subtle">
              <Code2 className="size-3.5" /> Coding problems
            </p>
            <p className={cx('mt-1.5 text-xl font-semibold tabular-nums', status.problemsPassed === status.problemsTotal && 'text-success')}>
              {status.problemsPassed} / {status.problemsTotal}
            </p>
            <p className="text-[12px] text-muted">solved</p>
          </Panel>
        )}
        <Panel as="div" className={cx('p-4', status.passed && 'border-success/40 bg-success/5')}>
          <p className="flex items-center gap-2 text-[12px] text-subtle">
            <Award className="size-3.5" /> Checkpoint
          </p>
          <p className={cx('mt-1.5 text-xl font-semibold', status.passed ? 'text-success' : 'text-fg')}>{status.passed ? 'Passed' : 'Not yet'}</p>
          <p className="text-[12px] text-muted">
            {lessonsLeft > 0 ? `${lessonsLeft} lesson${lessonsLeft === 1 ? '' : 's'} left in this phase` : 'All lessons done'}
          </p>
        </Panel>
      </div>

      {status.passed && (
        <Panel className="mb-6 flex flex-col gap-3 border-success/30 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-success">{progress.status === 'completed' ? `Phase ${phase.number} complete` : 'Checkpoint passed'}</p>
            <p className="mt-0.5 text-[13px] text-muted">
              {progress.status === 'completed'
                ? 'You have shown you understand this phase. On to the next one.'
                : `Finish the remaining ${lessonsLeft} lesson${lessonsLeft === 1 ? '' : 's'} to complete the phase.`}
            </p>
          </div>
          {progress.status === 'completed' && nextPhase ? (
            <a href={phaseHref(nextPhase.id)} className={buttonClass('primary')}>
              Phase {nextPhase.number} <ArrowRight className="size-4" />
            </a>
          ) : (
            firstOpenLesson && (
              <a href={lessonHref(firstOpenLesson.id)} className={buttonClass('secondary')}>
                Next lesson <ArrowRight className="size-4" />
              </a>
            )
          )}
        </Panel>
      )}

      {hasQuestions && hasProblems && (
        <div className="mb-4">
          <SegmentedControl
            label="Checkpoint section"
            value={activeTab}
            onChange={setTab}
            options={[
              { value: 'questions', label: `Questions (${checkpoint.questions.length})` },
              { value: 'problems', label: `Coding problems (${checkpoint.problems.length})` },
            ]}
          />
        </div>
      )}

      {activeTab === 'questions' ? (
        <QuizSection phase={phase} questions={checkpoint.questions} />
      ) : (
        <div className="flex flex-col gap-3">
          {checkpoint.problems.map((problem, i) => (
            <ProblemCard
              key={problem.id}
              phase={phase}
              problem={problem}
              index={i}
              open={openProblem === problem.id}
              onToggle={() => setOpenProblem((current) => (current === problem.id ? null : problem.id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
