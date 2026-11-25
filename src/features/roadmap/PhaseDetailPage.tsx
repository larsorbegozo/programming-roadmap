import { ArrowLeft, ArrowRight, Clock, Target } from 'lucide-react';
import { ResourceLink } from '../../components/ResourceLink';
import { Checkbox, EmptyState, Panel, ProgressRing, SectionTitle, buttonClass } from '../../components/ui';
import { curriculum, getPhase } from '../../data/curriculum';
import { getResource } from '../../data/resources';
import { useAppState } from '../../hooks/useAppState';
import { lessonHref, phaseHref } from '../../hooks/useHashRoute';
import { getNextLesson, getPhaseProgress } from '../../lib/progress';
import type { Resource } from '../../types/curriculum';
import { LessonRow } from './LessonRow';
import { PhaseStatusBadge } from './PhaseStatus';

export function PhaseDetailPage({ phaseId }: { phaseId: string }) {
  const { state, dispatch } = useAppState();
  const phase = getPhase(phaseId);

  if (!phase) {
    return (
      <EmptyState
        title="Phase not found"
        description="This phase doesn't exist. It may have been a broken link."
        action={
          <a href="#/roadmap" className={buttonClass('secondary')}>
            Back to roadmap
          </a>
        }
      />
    );
  }

  const progress = getPhaseProgress(state, phase);
  const next = getNextLesson(state);
  const nextInPhase = phase.lessons.find((l) => !state.completedLessons[l.id]);
  const resources = phase.resourceIds.map(getResource).filter((r): r is Resource => Boolean(r));
  const exercises = phase.lessons.flatMap((l) => l.exercises.map((e) => ({ ...e, lesson: l })));
  const prev = curriculum[phase.number - 1];
  const following = curriculum[phase.number + 1];

  return (
    <>
      <a href="#/roadmap" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
        <ArrowLeft className="size-3.5" /> Roadmap
      </a>

      <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-accent">Phase {phase.number}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{phase.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {phase.duration}
            </span>
            <PhaseStatusBadge status={progress.status} />
          </div>
          <p className="mt-4 max-w-2xl text-muted">{phase.description}</p>
          {nextInPhase && (
            <a href={lessonHref(nextInPhase.id)} className={`${buttonClass('primary')} mt-5`}>
              {progress.completed === 0 ? 'Start phase' : 'Continue phase'} <ArrowRight className="size-4" />
            </a>
          )}
        </div>
        <ProgressRing value={progress.percent} size={112}>
          <div>
            <div className="text-xl font-semibold tabular-nums">{progress.percent}%</div>
            <div className="text-[11px] text-subtle">
              {progress.completed}/{progress.total}
            </div>
          </div>
        </ProgressRing>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <div>
            <SectionTitle>Lessons</SectionTitle>
            <Panel className="overflow-hidden">
              <ul className="divide-y divide-line">
                {phase.lessons.map((l) => (
                  <LessonRow key={l.id} lesson={l} isNext={l.id === next?.id} />
                ))}
              </ul>
            </Panel>
          </div>

          {exercises.length > 0 && (
            <div>
              <SectionTitle>{phase.practiceLabel}</SectionTitle>
              <Panel className="overflow-hidden">
                <ul className="divide-y divide-line">
                  {exercises.map((ex) => (
                    <li key={ex.id} className="flex items-center gap-3 px-4 py-2.5">
                      <Checkbox
                        size="sm"
                        checked={Boolean(state.completedExercises[ex.id])}
                        onChange={() => dispatch({ type: 'toggleExercise', exerciseId: ex.id })}
                        label={`Mark exercise "${ex.title}" as done`}
                      />
                      <span className={state.completedExercises[ex.id] ? 'flex-1 text-subtle line-through' : 'flex-1'}>{ex.title}</span>
                      <a href={lessonHref(ex.lesson.id)} className="hidden shrink-0 text-[12px] text-subtle hover:text-fg sm:inline">
                        Lesson {ex.lesson.number}
                      </a>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <div>
            <SectionTitle>Objectives</SectionTitle>
            <ul className="flex flex-col gap-2">
              {phase.objectives.map((o) => (
                <li key={o} className="flex gap-2.5 text-muted">
                  <Target className="mt-0.5 size-4 shrink-0 text-accent" />
                  {o}
                </li>
              ))}
            </ul>
          </div>
          {resources.length > 0 && (
            <div>
              <SectionTitle>Core resources</SectionTitle>
              <div className="flex flex-col gap-2">
                {resources.map((r) => (
                  <ResourceLink key={r.id} resource={r} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      <nav className="mt-10 flex justify-between gap-3 border-t border-line pt-5 text-[13px]" aria-label="Phase navigation">
        {prev ? (
          <a href={phaseHref(prev.id)} className="inline-flex min-w-0 items-center gap-1.5 text-muted hover:text-fg">
            <ArrowLeft className="size-3.5 shrink-0" /> <span className="truncate">Phase {prev.number}: {prev.title}</span>
          </a>
        ) : (
          <span />
        )}
        {following && (
          <a href={phaseHref(following.id)} className="inline-flex min-w-0 items-center gap-1.5 text-right text-muted hover:text-fg">
            <span className="truncate">Phase {following.number}: {following.title}</span> <ArrowRight className="size-3.5 shrink-0" />
          </a>
        )}
      </nav>
    </>
  );
}
