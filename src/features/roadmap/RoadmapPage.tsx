import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, Clock, SearchX } from 'lucide-react';
import { SearchInput } from '../../components/SearchInput';
import { cx, EmptyState, PageHeader, ProgressBar, SegmentedControl } from '../../components/ui';
import { curriculum } from '../../data/curriculum';
import { useAppState } from '../../hooks/useAppState';
import { phaseHref } from '../../hooks/useHashRoute';
import { getCurrentPhase, getNextLesson, getPhaseProgress, isLessonComplete } from '../../lib/progress';
import type { Lesson } from '../../types/curriculum';
import { LessonRow } from './LessonRow';
import { PhaseStatusBadge } from './PhaseStatus';

type StatusFilter = 'all' | 'todo' | 'done';

function matches(lesson: Lesson, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [lesson.title, lesson.description, ...lesson.objectives, ...lesson.exercises.map((e) => e.title)].some((t) => t.toLowerCase().includes(q));
}

export function RoadmapPage() {
  const { state } = useAppState();
  const currentPhase = getCurrentPhase(state);
  const nextLesson = getNextLesson(state);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([currentPhase.id]));
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  const filtering = query.trim().length > 0 || status !== 'all';

  const phases = useMemo(
    () =>
      curriculum.map((phase) => ({
        phase,
        progress: getPhaseProgress(state, phase),
        lessons: phase.lessons.filter((l) => {
          if (!matches(l, query)) return false;
          const done = isLessonComplete(state, l.id);
          return status === 'all' || (status === 'done' ? done : !done);
        }),
      })),
    [state, query, status],
  );

  const visible = filtering ? phases.filter((p) => p.lessons.length > 0) : phases;

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = visible.every((p) => expanded.has(p.phase.id));

  return (
    <>
      <PageHeader
        title="Learning roadmap"
        description="Nine phases from zero to your first Lyra prototype. Follow the order, but feel free to explore."
      />

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Search lessons, objectives, exercises…" />
        </div>
        <div className="flex items-center gap-2">
          <SegmentedControl
            label="Filter by status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All' },
              { value: 'todo', label: 'To do' },
              { value: 'done', label: 'Done' },
            ]}
          />
          {!filtering && (
            <button
              type="button"
              onClick={() => setExpanded(allOpen ? new Set() : new Set(curriculum.map((p) => p.id)))}
              className="h-8 whitespace-nowrap rounded-lg px-2.5 text-[13px] text-muted hover:bg-surface-2 hover:text-fg"
            >
              {allOpen ? 'Collapse all' : 'Expand all'}
            </button>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={<SearchX className="size-6" />} title="No lessons match" description="Try a different search term or status filter." />
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map(({ phase, progress, lessons }) => {
            const open = filtering || expanded.has(phase.id);
            const isCurrent = phase.id === currentPhase.id && progress.status !== 'completed';
            return (
              <li key={phase.id} className={cx('overflow-hidden rounded-xl border bg-surface', isCurrent ? 'border-accent/35' : 'border-line')}>
                <button
                  type="button"
                  onClick={() => toggle(phase.id)}
                  aria-expanded={open}
                  disabled={filtering}
                  className="flex w-full items-start gap-4 p-4 text-left transition-colors enabled:hover:bg-surface-2 sm:p-5"
                >
                  <span
                    className={cx(
                      'grid size-9 shrink-0 place-items-center rounded-lg border text-[13px] font-semibold tabular-nums',
                      progress.status === 'completed' ? 'border-success/30 bg-success/10 text-success' : isCurrent ? 'border-accent/40 bg-accent-soft text-accent-strong' : 'border-line-strong text-muted',
                    )}
                  >
                    {phase.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-fg">{phase.title}</span>
                      <PhaseStatusBadge status={progress.status} />
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-[12px] text-subtle">
                      <Clock className="size-3" />
                      {phase.duration} · {progress.completed}/{progress.total} lessons
                    </span>
                    <span className="mt-3 flex items-center gap-3">
                      <ProgressBar value={progress.percent} tone={progress.status === 'completed' ? 'success' : 'accent'} label={`Phase ${phase.number} progress`} />
                      <span className="w-9 shrink-0 text-right text-[12px] tabular-nums text-muted">{progress.percent}%</span>
                    </span>
                  </span>
                  {!filtering && <ChevronDown className={cx('mt-2 size-4 shrink-0 text-subtle transition-transform', open && 'rotate-180')} />}
                </button>

                {open && (
                  <div className="border-t border-line">
                    {!filtering && (
                      <div className="grid gap-4 grid-cols-1 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5">
                        <div>
                          <p className="text-muted">{phase.description}</p>
                          <ul className="mt-3 grid gap-1 text-[13px] text-muted sm:grid-cols-2">
                            {phase.objectives.map((o) => (
                              <li key={o} className="flex gap-2">
                                <span className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <a href={phaseHref(phase.id)} className="inline-flex items-center gap-1 self-start whitespace-nowrap text-[13px] text-accent hover:text-accent-strong">
                          Phase details <ArrowRight className="size-3.5" />
                        </a>
                      </div>
                    )}
                    <ul className={cx('divide-y divide-line', !filtering && 'border-t border-line')}>
                      {lessons.map((lesson) => (
                        <LessonRow key={lesson.id} lesson={lesson} isNext={lesson.id === nextLesson?.id} />
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </>
  );
}
