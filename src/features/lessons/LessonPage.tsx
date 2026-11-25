import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, Award, CheckCircle2, Clock, Info, Target } from 'lucide-react';
import { ResourceLink } from '../../components/ResourceLink';
import { Button, Checkbox, EmptyState, Panel, SectionTitle, buttonClass, cx, DifficultyBadge } from '../../components/ui';
import { allLessons, getLesson, getPhase } from '../../data/curriculum';
import { getResource } from '../../data/resources';
import { useAppState } from '../../hooks/useAppState';
import { checkpointHref, lessonHref, phaseHref } from '../../hooks/useHashRoute';
import { formatDate, formatMinutes } from '../../lib/dates';
import { getCheckpointStatus, getNextStep } from '../../lib/progress';
import type { Resource } from '../../types/curriculum';
import { NotesEditor } from './NotesEditor';

export function LessonPage({ lessonId }: { lessonId: string }) {
  const { state, dispatch } = useAppState();
  const lesson = getLesson(lessonId);

  useEffect(() => {
    if (lesson) dispatch({ type: 'viewLesson', lessonId: lesson.id });
  }, [lesson, dispatch]);

  if (!lesson) {
    return (
      <EmptyState
        title="Lesson not found"
        description="This lesson doesn't exist. It may have been a broken link."
        action={
          <a href="#/roadmap" className={buttonClass('secondary')}>
            Back to roadmap
          </a>
        }
      />
    );
  }

  const phase = getPhase(lesson.phaseId);
  const index = allLessons.findIndex((l) => l.id === lesson.id);
  const prev = allLessons[index - 1];
  const next = allLessons[index + 1];
  const completedAt = state.completedLessons[lesson.id];
  const done = Boolean(completedAt);
  const resources = lesson.resourceIds.map(getResource).filter((r): r is Resource => Boolean(r));
  const step = getNextStep(state);
  const stepIndex = !step
    ? Infinity
    : step.kind === 'lesson'
      ? allLessons.findIndex((l) => l.id === step.lesson.id)
      : allLessons.findIndex((l) => l.id === step.phase.lessons[step.phase.lessons.length - 1]?.id) + 0.5;
  const skippedAhead = step !== null && stepIndex < index && !done;
  const isLastInPhase = phase ? lesson.number === phase.lessons.length : false;
  const checkpoint = phase ? getCheckpointStatus(state, phase.id) : null;
  const checkpointNext = isLastInPhase && checkpoint?.exists && !checkpoint.passed && phase;
  const exercisesDone = lesson.exercises.filter((e) => state.completedExercises[e.id]).length;

  const toggle = () => dispatch({ type: 'toggleLesson', lessonId: lesson.id });

  return (
    <article>
      <nav className="mb-4 flex min-w-0 items-center gap-1.5 text-[13px] text-muted" aria-label="Breadcrumb">
        <a href="#/roadmap" className="hover:text-fg">
          Roadmap
        </a>
        <span className="text-subtle">/</span>
        {phase && (
          <a href={phaseHref(phase.id)} className="truncate hover:text-fg">
            Phase {phase.number}: {phase.title}
          </a>
        )}
      </nav>

      <header className="mb-6">
        <p className="text-[13px] font-medium text-accent">
          Lesson {lesson.number} of {phase?.lessons.length}
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{lesson.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted">
          <DifficultyBadge difficulty={lesson.difficulty} />
          <span className="inline-flex items-center gap-1.5 text-[12px] text-subtle">
            <Clock className="size-3" /> ~{formatMinutes(lesson.estimatedMinutes)}
          </span>
          {done && completedAt && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-success">
              <CheckCircle2 className="size-3" /> Completed {formatDate(completedAt)}
            </span>
          )}
        </div>
        <p className="mt-4 max-w-2xl text-[15px] text-muted">{lesson.description}</p>
      </header>

      {skippedAhead && step && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-[13px] text-muted">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          {step.kind === 'lesson' ? (
            <span>
              You're ahead of the recommended order. The next lesson in sequence is{' '}
              <a href={lessonHref(step.lesson.id)} className="text-accent hover:text-accent-strong">
                {step.lesson.title}
              </a>
              . You can still continue here.
            </span>
          ) : (
            <span>
              You haven't passed the{' '}
              <a href={checkpointHref(step.phase.id)} className="text-accent hover:text-accent-strong">
                Phase {step.phase.number} checkpoint
              </a>{' '}
              yet. It's the recommended next step, but you can still continue here.
            </span>
          )}
        </div>
      )}

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-8">
          <section>
            <SectionTitle>1 · Learning objectives</SectionTitle>
            <ul className="flex flex-col gap-2">
              {lesson.objectives.map((o) => (
                <li key={o} className="flex gap-2.5">
                  <Target className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionTitle>2 · Study with these resources</SectionTitle>
            {resources.length > 0 ? (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {resources.map((r) => (
                  <ResourceLink key={r.id} resource={r} />
                ))}
              </div>
            ) : (
              <p className="text-muted">No specific resource — use the phase resources.</p>
            )}
          </section>

          {lesson.exercises.length > 0 && (
            <section>
              <SectionTitle action={<span className="text-[12px] tabular-nums text-subtle">{exercisesDone}/{lesson.exercises.length}</span>}>
                3 · Practical exercises
              </SectionTitle>
              <Panel className="overflow-hidden">
                <ul className="divide-y divide-line">
                  {lesson.exercises.map((ex) => {
                    const exDone = Boolean(state.completedExercises[ex.id]);
                    return (
                      <li key={ex.id} className="flex items-center gap-3 px-4 py-3">
                        <Checkbox checked={exDone} onChange={() => dispatch({ type: 'toggleExercise', exerciseId: ex.id })} label={`Mark exercise "${ex.title}" as done`} />
                        <span className={cx(exDone && 'text-subtle line-through')}>{ex.title}</span>
                      </li>
                    );
                  })}
                </ul>
              </Panel>
              <p className="mt-2 text-[12px] text-subtle">Write the code yourself first. Ask Claude Code to review it afterwards, not to write it for you.</p>
            </section>
          )}

          <section>
            <SectionTitle>{lesson.exercises.length > 0 ? '4' : '3'} · Personal notes</SectionTitle>
            <NotesEditor lessonId={lesson.id} />
          </section>
        </div>

        <aside className="lg:sticky lg:top-10 lg:self-start">
          <Panel className={cx('p-5', done && 'border-success/30')}>
            <p className="font-medium">{done ? 'Lesson complete' : 'Finished this lesson?'}</p>
            <p className="mt-1 text-[13px] text-muted">
              {done ? 'Nice work. Move on when you are ready.' : 'Mark it complete once you can explain the objectives in your own words.'}
            </p>
            <Button variant={done ? 'secondary' : 'primary'} className="mt-4 w-full" onClick={toggle}>
              {done ? (
                <>Mark as incomplete</>
              ) : (
                <>
                  <CheckCircle2 className="size-4" /> Mark as complete
                </>
              )}
            </Button>
            {done && checkpointNext ? (
              <a href={checkpointHref(checkpointNext.id)} className={`${buttonClass('primary')} mt-2 w-full`}>
                <Award className="size-4" /> Take the checkpoint
              </a>
            ) : (
              done &&
              next && (
                <a href={lessonHref(next.id)} className={`${buttonClass('primary')} mt-2 w-full`}>
                  Next lesson <ArrowRight className="size-4" />
                </a>
              )
            )}
          </Panel>
        </aside>
      </div>

      <nav className="mt-10 grid grid-cols-2 gap-3 border-t border-line pt-5 text-[13px]" aria-label="Lesson navigation">
        {prev ? (
          <a href={lessonHref(prev.id)} className="group min-w-0 rounded-lg p-2 -m-2 hover:bg-surface">
            <span className="flex items-center gap-1 text-subtle">
              <ArrowLeft className="size-3.5" /> Previous
            </span>
            <span className="mt-0.5 block truncate text-muted group-hover:text-fg">{prev.title}</span>
          </a>
        ) : (
          <span />
        )}
        {isLastInPhase && phase && checkpoint?.exists ? (
          <a href={checkpointHref(phase.id)} className="group min-w-0 rounded-lg p-2 -m-2 text-right hover:bg-surface">
            <span className="flex items-center justify-end gap-1 text-subtle">
              Next <ArrowRight className="size-3.5" />
            </span>
            <span className="mt-0.5 block truncate text-muted group-hover:text-fg">Phase {phase.number} checkpoint</span>
          </a>
        ) : next && (
          <a href={lessonHref(next.id)} className="group min-w-0 rounded-lg p-2 -m-2 text-right hover:bg-surface">
            <span className="flex items-center justify-end gap-1 text-subtle">
              Next <ArrowRight className="size-3.5" />
            </span>
            <span className="mt-0.5 block truncate text-muted group-hover:text-fg">{next.title}</span>
          </a>
        )}
      </nav>
    </article>
  );
}
