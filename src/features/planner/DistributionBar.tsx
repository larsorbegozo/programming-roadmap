import { CATEGORY_LABEL } from '../../lib/progress';
import { formatMinutes } from '../../lib/dates';
import type { StudyCategory } from '../../types/state';
import { CATEGORIES, CATEGORY_COLOR } from './categories';

/** Stacked bar of logged minutes per category, plus a legend comparing to the plan. */
export function DistributionBar({ actual, planned }: { actual: Record<StudyCategory, number>; planned: Record<StudyCategory, number> }) {
  const total = CATEGORIES.reduce((s, c) => s + actual[c], 0);
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-3" role="img" aria-label="Distribution of study time by category">
        {total > 0 &&
          CATEGORIES.map((c) => (
            <div key={c} style={{ width: `${(actual[c] / total) * 100}%`, background: CATEGORY_COLOR[c] }} className="h-full transition-[width] duration-500" />
          ))}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {CATEGORIES.map((c) => (
          <li key={c} className="flex items-start gap-2">
            <span className="mt-1.5 size-2 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
            <span className="min-w-0">
              <span className="block truncate text-[13px] text-muted">{CATEGORY_LABEL[c]}</span>
              <span className="text-[13px] tabular-nums">
                {formatMinutes(actual[c])} <span className="text-subtle">/ {planned[c]}h</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
