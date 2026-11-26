import { ChevronRight, GraduationCap } from 'lucide-react';
import { Badge, cx } from '../../components/ui';
import { getFinal } from '../../data/finals';
import { useAppState } from '../../hooks/useAppState';
import { examHref } from '../../hooks/useHashRoute';
import { formatCountdown, getUnitExam, sittingLabel } from '../../lib/exams';
import type { Phase } from '../../types/curriculum';
import { fmtDate } from './dates';

/** List row linking to a phase's final exam, styled to sit under the checkpoint row. */
export function FinalRow({ phase, isNext }: { phase: Phase; isNext?: boolean }) {
  const { state } = useAppState();
  const final = getFinal(phase.id);
  if (!final) return null;
  const unit = state.examPlan ? getUnitExam(state, phase.id) : undefined;
  const passed = unit?.status === 'passed';

  let detail = `${final.minutes} min · ${final.questions.length} questions${final.problems.length ? ` · ${final.problems.length} coding` : ''}`;
  if (!unit) detail += ' · set up your exam calendar';
  else if (passed) detail += ` · grade ${unit.passedAttempt?.grade}`;
  else detail += ` · ${sittingLabel(unit.sitting).toLowerCase()} by ${fmtDate(unit.deadline)} (${formatCountdown(unit.daysLeft)})`;

  return (
    <li>
      <a href={unit ? examHref(phase.id) : '#/exams'} className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface-2 sm:px-4">
        <span className={cx('grid size-5 shrink-0 place-items-center rounded-md', passed ? 'bg-success text-bg' : 'bg-accent-soft text-accent')}>
          <GraduationCap className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-medium text-fg">Phase {phase.number} final exam</span>
          <span className={cx('mt-0.5 block truncate text-[11px]', unit && !passed && unit.daysLeft < 0 ? 'text-danger' : 'text-subtle')}>{detail}</span>
        </span>
        {passed ? <Badge tone="success">Passed</Badge> : isNext ? <Badge tone="accent">Next</Badge> : null}
        <ChevronRight className="size-4 shrink-0 text-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      </a>
    </li>
  );
}
