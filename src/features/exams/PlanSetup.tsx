import { useMemo, useState } from 'react';
import { Button, Panel, cx, inputClass } from '../../components/ui';
import { curriculum } from '../../data/curriculum';
import { useAppState } from '../../hooks/useAppState';
import { isValidDateKey } from '../../lib/dates';
import { generatePlan } from '../../lib/exams';
import { MAX_WEEKLY_HOURS, MIN_WEEKLY_HOURS } from '../../lib/validation';
import { fmtDate } from './dates';

/** Defaults chosen with the learner: start 1 Dec 2026, 20 h/week, holidays 22 Dec – 4 Jan off. */
const DEFAULTS = { startDate: '2026-12-01', hours: '20', breakOn: true, breakStart: '2026-12-22', breakEnd: '2027-01-04' };

export function PlanSetup({ onDone, replanning }: { onDone?: () => void; replanning?: boolean }) {
  const { state, dispatch } = useAppState();
  const existing = state.examPlan;
  const [startDate, setStartDate] = useState(existing?.startDate ?? DEFAULTS.startDate);
  const [hours, setHours] = useState(String(existing?.hoursPerWeek ?? DEFAULTS.hours));
  const [breakOn, setBreakOn] = useState(existing ? Boolean(existing.breakStart) : DEFAULTS.breakOn);
  const [breakStart, setBreakStart] = useState(existing?.breakStart ?? DEFAULTS.breakStart);
  const [breakEnd, setBreakEnd] = useState(existing?.breakEnd ?? DEFAULTS.breakEnd);
  const [alsoTarget, setAlsoTarget] = useState(true);

  const hoursNum = Number(hours);
  const errors: string[] = [];
  if (!isValidDateKey(startDate)) errors.push('Choose a valid start date.');
  if (!Number.isInteger(hoursNum) || hoursNum < MIN_WEEKLY_HOURS || hoursNum > MAX_WEEKLY_HOURS)
    errors.push(`Hours per week must be a whole number from ${MIN_WEEKLY_HOURS} to ${MAX_WEEKLY_HOURS}.`);
  if (breakOn && (!isValidDateKey(breakStart) || !isValidDateKey(breakEnd) || breakEnd < breakStart)) errors.push('The break needs a valid start and end.');

  const valid = errors.length === 0;
  const preview = useMemo(
    () => (valid ? generatePlan({ startDate, hoursPerWeek: hoursNum, ...(breakOn ? { breakStart, breakEnd } : {}) }) : null),
    [valid, startDate, hoursNum, breakOn, breakStart, breakEnd],
  );

  const create = () => {
    if (!preview) return;
    dispatch({ type: 'setExamPlan', plan: preview });
    if (alsoTarget && hoursNum !== state.settings.weeklyHoursTarget) dispatch({ type: 'updateSettings', settings: { weeklyHoursTarget: hoursNum } });
    onDone?.();
  };

  const last = preview ? preview.units[curriculum[curriculum.length - 1]?.id ?? ''] : undefined;

  return (
    <div className="flex flex-col gap-5">
      <Panel className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
          Start date
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
        </label>
        <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
          Study hours per week
          <input type="number" min={MIN_WEEKLY_HOURS} max={MAX_WEEKLY_HOURS} value={hours} onChange={(e) => setHours(e.target.value)} className={inputClass} />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-muted sm:col-span-2">
          <input type="checkbox" checked={breakOn} onChange={(e) => setBreakOn(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          Take a break (no study days, no deadlines)
        </label>
        {breakOn && (
          <>
            <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
              Break starts
              <input type="date" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} className={inputClass} />
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
              Break ends (last day off)
              <input type="date" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} className={inputClass} />
            </label>
          </>
        )}
        <label className="flex items-center gap-2 text-[13px] text-muted sm:col-span-2">
          <input type="checkbox" checked={alsoTarget} onChange={(e) => setAlsoTarget(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          Also set my weekly study plan to this many hours
        </label>
        {errors.length > 0 && (
          <ul role="alert" className="text-[13px] text-danger sm:col-span-2">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </Panel>

      {preview && (
        <Panel className="overflow-hidden">
          <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
            <p className="font-medium">Preview</p>
            {last && <p className="text-[12px] text-subtle">Last final: {fmtDate(last.deadline)}</p>}
          </div>
          <ol className="divide-y divide-line">
            {curriculum.map((phase) => {
              const unit = preview.units[phase.id];
              if (!unit) return null;
              return (
                <li key={phase.id} className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 text-[13px] sm:px-5">
                  <span className="tabular-nums text-subtle">{phase.number}</span>
                  <span className="truncate">{phase.title}</span>
                  <span className="text-right tabular-nums text-muted">
                    <span className="hidden text-subtle sm:inline">{fmtDate(unit.start)} → </span>
                    <span className="font-medium text-fg">{fmtDate(unit.deadline)}</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </Panel>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={create} disabled={!preview}>
          {replanning ? 'Save new calendar' : 'Create my exam calendar'}
        </Button>
        {onDone && replanning && (
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
        )}
        <p className={cx('text-[12px] text-subtle', replanning && 'w-full')}>
          {replanning ? 'Deadlines will change. Your lessons, checkpoints and exam results are kept.' : 'You can re-plan later, but the point is to commit to these dates.'}
        </p>
      </div>
    </div>
  );
}
