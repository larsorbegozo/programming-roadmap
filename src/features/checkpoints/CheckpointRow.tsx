import { Award, ChevronRight } from 'lucide-react';
import { Badge, cx } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { checkpointHref } from '../../hooks/useHashRoute';
import { getCheckpointStatus, QUIZ_PASS_PERCENT } from '../../lib/progress';
import type { Phase } from '../../types/curriculum';

/** List row linking to a phase's checkpoint, styled to sit under the lesson rows. */
export function CheckpointRow({ phase, isNext }: { phase: Phase; isNext?: boolean }) {
  const { state } = useAppState();
  const status = getCheckpointStatus(state, phase.id);
  if (!status.exists) return null;
  const parts = [
    status.questionsTotal > 0 && `${status.questionsTotal} questions${status.bestScore !== null ? ` · best ${status.bestScore}%` : ''}`,
    status.problemsTotal > 0 && `${status.problemsPassed}/${status.problemsTotal} coding problems`,
  ].filter(Boolean);

  return (
    <li>
      <a href={checkpointHref(phase.id)} className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-2 sm:px-4">
        <span className={cx('grid size-5 shrink-0 place-items-center rounded-md', status.passed ? 'bg-success text-bg' : 'bg-accent-soft text-accent')}>
          <Award className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-fg">Phase {phase.number} checkpoint</span>
          <span className="mt-0.5 block truncate text-[11px] text-subtle">
            {parts.join(' · ')}
            {!status.passed && ` · pass with ${QUIZ_PASS_PERCENT}%${status.problemsTotal > 0 ? ' + all problems' : ''}`}
          </span>
        </span>
        {status.passed ? <Badge tone="success">Passed</Badge> : isNext ? <Badge tone="accent">Next</Badge> : null}
        <ChevronRight className="size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </li>
  );
}
