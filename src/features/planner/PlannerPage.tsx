import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import { Button, cx, EmptyState, Panel, PageHeader, ProgressBar, SectionTitle } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { addDays, formatDay, formatMinutes, formatWeekRange, todayKey, weekStartKey } from '../../lib/dates';
import { CATEGORY_LABEL, minutesByCategory, plannedSlots, sessionsInWeek, totalMinutes, weeklyAllocation, type PlannedSlot } from '../../lib/progress';
import { createId } from '../../lib/storage';
import { MAX_SESSION_MINUTES } from '../../lib/validation';
import type { StudySession } from '../../types/state';
import { CATEGORIES, CATEGORY_COLOR } from './categories';
import { DailyActivity } from './DailyActivity';
import { DistributionBar } from './DistributionBar';
import { SessionForm } from './SessionForm';
import { WeeklyGoal } from './WeeklyGoal';

export function PlannerPage() {
  const { state, dispatch } = useAppState();
  const today = todayKey();
  const currentWeek = weekStartKey(today);
  const [weekKey, setWeekKey] = useState(currentWeek);

  const target = state.settings.weeklyHoursTarget;
  const allocation = weeklyAllocation(target);
  const slots = plannedSlots(target);
  const sessions = sessionsInWeek(state.sessions, weekKey).sort((a, b) => b.date.localeCompare(a.date));
  const logged = totalMinutes(sessions);
  const byCategory = minutesByCategory(sessions);
  const isFuture = weekKey > currentWeek;
  const isCurrent = weekKey === currentWeek;
  const weekEnd = addDays(weekKey, 6);
  // Slots completed while viewing another week are dated to the last day of that week.
  const slotDate = isCurrent ? today : weekEnd;

  const slotSession = (slot: PlannedSlot): StudySession | undefined => sessions.find((s) => s.slotId === slot.id);

  const toggleSlot = (slot: PlannedSlot) => {
    const existing = slotSession(slot);
    if (existing) dispatch({ type: 'removeSession', sessionId: existing.id });
    else dispatch({ type: 'addSession', session: { id: createId(), date: slotDate, category: slot.category, minutes: slot.minutes, slotId: slot.id } });
  };

  const completedSlots = slots.filter((s) => slotSession(s)).length;

  return (
    <>
      <PageHeader
        title="Weekly study plan"
        description={`A ${target}-hour week: ${allocation.theory}h theory, ${allocation.practice}h practice, ${allocation.revision}h revision. Change the target in Settings.`}
      />

      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={() => setWeekKey(addDays(weekKey, -7))} aria-label="Previous week">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-36 text-center font-medium tabular-nums">{formatWeekRange(weekKey)}</span>
          <Button size="sm" variant="ghost" onClick={() => setWeekKey(addDays(weekKey, 7))} aria-label="Next week">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        {!isCurrent && (
          <Button size="sm" onClick={() => setWeekKey(currentWeek)}>
            This week
          </Button>
        )}
      </div>

      <Panel className="mb-6 p-5">
        <SectionTitle>Objective for this week</SectionTitle>
        <WeeklyGoal weekKey={weekKey} />
      </Panel>

      <div className="mb-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Panel className="p-5">
          <SectionTitle>Hours this week</SectionTitle>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold tabular-nums tracking-tight">{formatMinutes(logged)}</span>
            <span className="text-muted">of {target}h</span>
          </div>
          <ProgressBar value={(logged / (target * 60)) * 100} className="mt-3" label="Weekly hours progress" />
          <div className="mt-5">
            <DistributionBar actual={byCategory} planned={allocation} />
          </div>
        </Panel>
        <Panel className="p-5">
          <SectionTitle action={<span className="text-[12px] text-subtle">sessions per day</span>}>Daily activity</SectionTitle>
          <DailyActivity weekKey={weekKey} sessions={sessions} />
        </Panel>
      </div>

      <section className="mb-6">
        <SectionTitle action={<span className="text-[12px] tabular-nums text-subtle">{completedSlots}/{slots.length} done</span>}>Planned sessions</SectionTitle>
        {isFuture ? (
          <EmptyState title="This week hasn't started" description="You can mark planned sessions once the week begins." />
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
            {CATEGORIES.map((c) => {
              const catSlots = slots.filter((s) => s.category === c);
              return (
                <Panel key={c} className="p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                    <span className="text-[13px] font-medium">{CATEGORY_LABEL[c]}</span>
                    <span className="ml-auto text-[12px] tabular-nums text-subtle">{allocation[c]}h</span>
                  </div>
                  {catSlots.length === 0 ? (
                    <p className="text-[13px] text-subtle">No hours planned.</p>
                  ) : (
                    <ul className="flex flex-col gap-1.5">
                      {catSlots.map((slot) => {
                        const session = slotSession(slot);
                        return (
                          <li key={slot.id}>
                            <button
                              type="button"
                              role="checkbox"
                              aria-checked={Boolean(session)}
                              onClick={() => toggleSlot(slot)}
                              className={cx(
                                'flex h-9 w-full items-center gap-2.5 rounded-lg border px-3 text-left text-[13px] transition-colors',
                                session ? 'border-transparent bg-surface-3 text-muted' : 'border-line hover:border-line-strong hover:bg-surface-2',
                              )}
                            >
                              <span className={cx('grid size-4 place-items-center rounded border', session ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong')}>
                                {session && <Check className="size-3" strokeWidth={3} />}
                              </span>
                              Session {slot.index}
                              <span className="ml-auto text-[12px] tabular-nums text-subtle">{session ? `${formatDay(session.date)} · ${formatMinutes(session.minutes)}` : '60m'}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </Panel>
              );
            })}
          </div>
        )}
      </section>

      <Panel className="mb-6 p-5">
        <SectionTitle>Log a study session</SectionTitle>
        <SessionForm key={weekKey} defaultDate={isCurrent ? today : weekKey > currentWeek ? today : weekEnd} />
      </Panel>

      <section>
        <SectionTitle>Sessions this week</SectionTitle>
        {sessions.length === 0 ? (
          <EmptyState icon={<Clock className="size-6" />} title="No sessions logged" description="Tick a planned session above or log a custom one." />
        ) : (
          <Panel className="overflow-hidden">
            <ul className="divide-y divide-line">
              {sessions.map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </ul>
          </Panel>
        )}
      </section>
    </>
  );
}

function SessionRow({ session }: { session: StudySession }) {
  const { dispatch } = useAppState();
  const [minutes, setMinutes] = useState(String(session.minutes));

  const commit = () => {
    const value = Math.round(Number(minutes));
    if (!Number.isFinite(value) || value < 1 || value > MAX_SESSION_MINUTES) {
      setMinutes(String(session.minutes));
      return;
    }
    if (value !== session.minutes) dispatch({ type: 'updateSession', session: { ...session, minutes: value } });
  };

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      <span className="size-2 shrink-0 rounded-full" style={{ background: CATEGORY_COLOR[session.category] }} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px]">
          {CATEGORY_LABEL[session.category]}
          {session.slotId && <span className="text-subtle"> · planned</span>}
        </span>
        <span className="block truncate text-[12px] text-subtle">
          {formatDay(session.date, { weekday: 'short', month: 'short', day: 'numeric' })}
          {session.note && ` · ${session.note}`}
        </span>
      </span>
      <label className="flex items-center gap-1.5 text-[12px] text-subtle">
        <input
          type="number"
          min={0}
          max={MAX_SESSION_MINUTES}
          step={5}
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
          aria-label="Minutes studied"
          className="h-8 w-16 rounded-md border border-line-strong bg-surface-2 px-2 text-right tabular-nums text-fg focus:border-accent/70 focus:outline-none"
        />
        min
      </label>
      <button type="button" onClick={() => dispatch({ type: 'removeSession', sessionId: session.id })} className="rounded-md p-1.5 text-subtle hover:bg-danger-soft hover:text-danger" aria-label="Delete session">
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
