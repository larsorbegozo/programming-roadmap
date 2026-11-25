import { cx } from '../../components/ui';
import { formatDay, formatMinutes, todayKey, weekDays } from '../../lib/dates';
import type { StudySession } from '../../types/state';

/** Seven small columns showing minutes and session count per day of the week. */
export function DailyActivity({ weekKey, sessions }: { weekKey: string; sessions: StudySession[] }) {
  const days = weekDays(weekKey);
  const today = todayKey();
  const perDay = days.map((d) => {
    const list = sessions.filter((s) => s.date === d);
    return { day: d, minutes: list.reduce((sum, s) => sum + s.minutes, 0), count: list.length };
  });
  const max = Math.max(60, ...perDay.map((d) => d.minutes));

  return (
    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
      {perDay.map(({ day, minutes, count }) => (
        <div key={day} className="flex flex-col items-center gap-1.5" title={`${formatDay(day, { weekday: 'long', month: 'short', day: 'numeric' })}: ${count} session${count === 1 ? '' : 's'}, ${formatMinutes(minutes)}`}>
          <div className="flex h-20 w-full items-end overflow-hidden rounded-md bg-surface-2">
            <div className={cx('w-full rounded-md transition-[height] duration-500', minutes > 0 ? 'bg-accent' : '')} style={{ height: `${(minutes / max) * 100}%` }} />
          </div>
          <span className={cx('text-[11px]', day === today ? 'font-medium text-fg' : 'text-subtle')}>{formatDay(day)}</span>
          <span className="text-[11px] tabular-nums text-muted">{count > 0 ? count : '–'}</span>
        </div>
      ))}
    </div>
  );
}
