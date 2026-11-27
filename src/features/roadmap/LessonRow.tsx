import { ChevronRight, NotebookPen } from 'lucide-react';
import { Badge, Checkbox, cx, DifficultyBadge } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { lessonHref } from '../../hooks/useHashRoute';
import { getLessonExercises } from '../../data/exercises';
import { formatMinutes } from '../../lib/dates';
import { lessonBlockers } from '../../lib/progress';
import type { Lesson } from '../../types/curriculum';

export function LessonRow({ lesson, isNext, showPhase }: { lesson: Lesson; isNext?: boolean; showPhase?: string }) {
  const { state, dispatch } = useAppState();
  const done = Boolean(state.completedLessons[lesson.id]);
  const hasNote = Boolean(state.notes[lesson.id]);
  const blockers = lessonBlockers(state, lesson.id);
  const locked = !done && blockers.length > 0;
  const exerciseCount = lesson.exercises.length + getLessonExercises(lesson.id).length;

  return (
    <li className="group flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-2 sm:px-4">
      <Checkbox
        checked={done}
        onChange={() => dispatch({ type: 'toggleLesson', lessonId: lesson.id })}
        label={`Mark "${lesson.title}" as ${done ? 'incomplete' : 'complete'}`}
        disabled={locked}
        title={locked ? 'Solve the core exercise first' : undefined}
      />
      <a href={lessonHref(lesson.id)} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="w-6 shrink-0 text-right text-[12px] tabular-nums text-subtle">{lesson.number}</span>
        <span className="min-w-0 flex-1">
          <span className={cx('block truncate', done ? 'text-subtle line-through decoration-line-strong' : 'text-fg')}>{lesson.title}</span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            {showPhase && <span className="text-[11px] text-subtle">{showPhase}</span>}
            <DifficultyBadge difficulty={lesson.difficulty} />
            <span className="hidden text-[11px] text-subtle sm:inline">{formatMinutes(lesson.estimatedMinutes)}</span>
            {exerciseCount > 0 && (
              <span className="text-[11px] text-subtle">
                {exerciseCount} exercise{exerciseCount === 1 ? '' : 's'}
              </span>
            )}
          </span>
        </span>
        {isNext && <Badge tone="accent">Next</Badge>}
        {hasNote && <NotebookPen className="size-3.5 shrink-0 text-subtle" aria-label="Has notes" />}
        <ChevronRight className="size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </li>
  );
}
