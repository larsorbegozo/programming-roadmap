import { ArrowRight, CalendarCheck, CheckCircle2, Flag, Flame, History, Hourglass, PartyPopper } from 'lucide-react';
import { cx, Panel, ProgressBar, ProgressRing, SectionTitle, StatTile, buttonClass } from '../../components/ui';
import { curriculum, getLesson, getPhase } from '../../data/curriculum';
import { allMilestones } from '../../data/milestones';
import { useAppState } from '../../hooks/useAppState';
import { lessonHref, phaseHref } from '../../hooks/useHashRoute';
import { formatMinutes, todayKey, weekStartKey } from '../../lib/dates';
import {
  currentStreak,
  formatWeeks,
  getCurrentPhase,
  getNextLesson,
  getOverallProgress,
  getPhaseProgress,
  getRemainingWeeks,
  plannedSlots,
  sessionsInWeek,
  totalMinutes,
} from '../../lib/progress';
import { DailyActivity } from '../planner/DailyActivity';
import { WeeklyGoal } from '../planner/WeeklyGoal';

export function DashboardPage() {
  const { state } = useAppState();
  const overall = getOverallProgress(state);
  const phase = getCurrentPhase(state);
  const phaseProgress = getPhaseProgress(state, phase);
  const next = getNextLesson(state);
  const nextPhase = next ? getPhase(next.phaseId) : undefined;
  const lastViewed = state.lastViewedLessonId ? getLesson(state.lastViewedLessonId) : undefined;
  const showResume = lastViewed && lastViewed.id !== next?.id && !state.completedLessons[lastViewed.id];

  const weekKey = weekStartKey(todayKey());
  const weekSessions = sessionsInWeek(state.sessions, weekKey);
  const weekMinutes = totalMinutes(weekSessions);
  const target = state.settings.weeklyHoursTarget;
  const plannedCount = plannedSlots(target).length;

  const achieved = allMilestones.filter((m) => state.achievements[m.id]);
  const remaining = allMilestones.filter((m) => !state.achievements[m.id]);
  const streak = currentStreak(state);
  const remainingWeeks = getRemainingWeeks(state);

  return (
    <>
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[13px] text-subtle">{overall.completed === 0 ? 'Welcome' : 'Welcome back'}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Your path to building Lyra</h1>
        </div>
        {next ? (
          <a href={lessonHref(next.id)} className={cx(buttonClass('primary'), 'h-10 px-5')}>
            {overall.completed === 0 ? 'Start learning' : 'Continue learning'} <ArrowRight className="size-4" />
          </a>
        ) : (
          <a href="#/progress" className={buttonClass('secondary')}>
            View achievements
          </a>
        )}
      </header>

      {/* Overview */}
      <Panel className="mb-4 grid grid-cols-1 gap-6 p-5 sm:p-6 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] md:items-center">
        <div className="flex items-center gap-5">
          <ProgressRing value={overall.percent} size={104}>
            <div>
              <div className="text-2xl font-semibold tabular-nums">{overall.percent}%</div>
              <div className="text-[11px] text-subtle">overall</div>
            </div>
          </ProgressRing>
          <div className="md:hidden">
            <p className="text-[12px] text-subtle">Lessons completed</p>
            <p className="text-lg font-semibold tabular-nums">
              {overall.completed} <span className="text-muted">/ {overall.total}</span>
            </p>
          </div>
        </div>

        <div className="min-w-0 md:border-l md:border-line md:pl-6">
          <p className="text-[12px] text-subtle">Current phase</p>
          <a href={phaseHref(phase.id)} className="mt-1 block truncate font-medium hover:text-accent-strong">
            Phase {phase.number} · {phase.title}
          </a>
          <div className="mt-3 flex items-center gap-3">
            <ProgressBar value={phaseProgress.percent} label="Current phase progress" />
            <span className="shrink-0 text-[12px] tabular-nums text-muted">
              {phaseProgress.completed}/{phaseProgress.total}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-subtle">{phase.duration}</p>
        </div>

        <div className="min-w-0 md:border-l md:border-line md:pl-6">
          {next && nextPhase ? (
            <>
              <p className="text-[12px] text-subtle">Recommended next lesson</p>
              <a href={lessonHref(next.id)} className="group mt-1 block">
                <span className="block truncate font-medium group-hover:text-accent-strong">{next.title}</span>
                <span className="mt-1 line-clamp-2 text-[13px] text-muted">{next.description}</span>
              </a>
              <p className="mt-2 text-[12px] text-subtle">
                Phase {nextPhase.number} · Lesson {next.number} · ~{formatMinutes(next.estimatedMinutes)}
              </p>
            </>
          ) : (
            <div className="flex items-start gap-3">
              <PartyPopper className="mt-0.5 size-5 text-accent" />
              <div>
                <p className="font-medium">Roadmap complete</p>
                <p className="text-[13px] text-muted">Every lesson is done. Keep building Lyra.</p>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {showResume && lastViewed && (
        <a href={lessonHref(lastViewed.id)} className="mb-4 flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-[13px] transition-colors hover:bg-surface-2">
          <History className="size-4 shrink-0 text-subtle" />
          <span className="min-w-0 flex-1 truncate">
            <span className="text-subtle">Last viewed: </span>
            {lastViewed.title}
          </span>
          <ArrowRight className="size-4 shrink-0 text-subtle" />
        </a>
      )}

      {/* Key stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<CheckCircle2 className="size-3.5" />} label="Milestones reached" value={achieved.length} hint={`${remaining.length} remaining`} />
        <StatTile icon={<Hourglass className="size-3.5" />} label="Estimated remaining" value={formatWeeks(remainingWeeks)} hint={`at ${target}h / week`} />
        <StatTile icon={<CalendarCheck className="size-3.5" />} label="This week" value={formatMinutes(weekMinutes)} hint={`of ${target}h target`} />
        <StatTile icon={<Flame className="size-3.5" />} label="Current streak" value={`${streak} day${streak === 1 ? '' : 's'}`} hint={streak > 0 ? 'Keep it going' : 'Study today to start one'} />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* This week */}
        <section>
          <SectionTitle action={<a href="#/planner" className="text-[12px] text-accent hover:text-accent-strong">Open plan</a>}>This week</SectionTitle>
          <Panel className="p-5">
            <p className="text-[12px] text-subtle">Objective</p>
            <div className="mt-1">
              <WeeklyGoal weekKey={weekKey} />
            </div>
            <div className="mt-5 flex items-baseline justify-between text-[13px]">
              <span className="text-muted">Study progress</span>
              <span className="tabular-nums">
                {formatMinutes(weekMinutes)} <span className="text-subtle">/ {target}h</span>
              </span>
            </div>
            <ProgressBar value={(weekMinutes / (target * 60)) * 100} className="mt-2" label="Weekly study progress" />
            <div className="mt-6 flex items-baseline justify-between text-[13px]">
              <span className="text-muted">Study sessions</span>
              <span className="tabular-nums">
                {weekSessions.length} <span className="text-subtle">completed · {plannedCount} planned</span>
              </span>
            </div>
            <div className="mt-3">
              <DailyActivity weekKey={weekKey} sessions={weekSessions} />
            </div>
          </Panel>
        </section>

        {/* Milestones */}
        <section>
          <SectionTitle action={<a href="#/roadmap" className="text-[12px] text-accent hover:text-accent-strong">Full roadmap</a>}>Phase milestones</SectionTitle>
          <Panel className="overflow-hidden">
            <ol className="divide-y divide-line">
              {curriculum.map((p) => {
                const prog = getPhaseProgress(state, p);
                const isCurrent = p.id === phase.id && prog.status !== 'completed';
                return (
                  <li key={p.id}>
                    <a href={phaseHref(p.id)} className="flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-2">
                      <span
                        className={cx(
                          'grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-semibold tabular-nums',
                          prog.status === 'completed' ? 'bg-success/15 text-success' : isCurrent ? 'bg-accent-soft text-accent-strong' : 'bg-surface-3 text-subtle',
                        )}
                      >
                        {prog.status === 'completed' ? <CheckCircle2 className="size-3.5" /> : p.number}
                      </span>
                      <span className={cx('min-w-0 flex-1 truncate text-[13px]', prog.status === 'not-started' && !isCurrent ? 'text-muted' : 'text-fg')}>{p.title}</span>
                      <span className="w-16 shrink-0">
                        <ProgressBar value={prog.percent} tone={prog.status === 'completed' ? 'success' : 'accent'} label={`Phase ${p.number} progress`} />
                      </span>
                      <span className="w-8 shrink-0 text-right text-[12px] tabular-nums text-subtle">{prog.percent}%</span>
                    </a>
                  </li>
                );
              })}
            </ol>
          </Panel>
          {remaining[0] && (
            <p className="mt-3 flex items-center gap-2 text-[13px] text-muted">
              <Flag className="size-3.5 text-accent" /> Next milestone: <span className="text-fg">{remaining.find((m) => m.kind === 'phase')?.title ?? remaining[0].title}</span>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
