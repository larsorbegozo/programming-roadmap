import { AlarmClock, ArrowRight, Award, CalendarCheck, CheckCircle2, Flag, Flame, GraduationCap, History, Hourglass, PartyPopper } from 'lucide-react';
import { cx, Panel, ProgressBar, ProgressRing, SectionTitle, StatTile, buttonClass } from '../../components/ui';
import { curriculum, getLesson } from '../../data/curriculum';
import { allMilestones } from '../../data/milestones';
import { useAppState } from '../../hooks/useAppState';
import { checkpointHref, examHref, lessonHref, phaseHref } from '../../hooks/useHashRoute';
import { formatCountdown, getNextFinal, sittingLabel } from '../../lib/exams';
import { fmtDate } from '../exams/dates';
import { formatMinutes, todayKey, weekStartKey } from '../../lib/dates';
import {
  currentStreak,
  formatWeeks,
  getCurrentPhase,
  getCheckpointStatus,
  getNextStep,
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
  const step = getNextStep(state);
  const nextHref = step ? (step.kind === 'lesson' ? lessonHref(step.lesson.id) : step.kind === 'checkpoint' ? checkpointHref(step.phase.id) : examHref(step.phase.id)) : null;
  const nextFinal = getNextFinal(state);
  const nextLessonId = step?.kind === 'lesson' ? step.lesson.id : undefined;
  const lastViewed = state.lastViewedLessonId ? getLesson(state.lastViewedLessonId) : undefined;
  const showResume = lastViewed && lastViewed.id !== nextLessonId && !state.completedLessons[lastViewed.id];
  const stepCheckpoint = step?.kind === 'checkpoint' ? getCheckpointStatus(state, step.phase.id) : null;

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
          <p className="text-[13px] text-subtle">{overall.lessonsCompleted === 0 ? 'Welcome' : 'Welcome back'}</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">Your path to building Lyra</h1>
        </div>
        {step && nextHref ? (
          <a href={nextHref} className={cx(buttonClass('primary'), 'h-10 px-5')}>
            {overall.lessonsCompleted === 0 ? 'Start learning' : step.kind === 'checkpoint' ? 'Take the checkpoint' : step.kind === 'final' ? 'Sit the final exam' : 'Continue learning'}{' '}
            <ArrowRight className="size-4" />
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
              {overall.lessonsCompleted} <span className="text-muted">/ {overall.lessonsTotal}</span>
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
              {phaseProgress.lessonsCompleted}/{phaseProgress.lessonsTotal}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-subtle">
            {phase.duration}
            {phaseProgress.hasCheckpoint && ` · checkpoint ${phaseProgress.checkpointPassed ? 'passed' : 'pending'}`}
          </p>
        </div>

        <div className="min-w-0 md:border-l md:border-line md:pl-6">
          {step?.kind === 'lesson' ? (
            <>
              <p className="text-[12px] text-subtle">Recommended next lesson</p>
              <a href={lessonHref(step.lesson.id)} className="group mt-1 block">
                <span className="block truncate font-medium group-hover:text-accent-strong">{step.lesson.title}</span>
                <span className="mt-1 line-clamp-2 text-[13px] text-muted">{step.lesson.description}</span>
              </a>
              <p className="mt-2 text-[12px] text-subtle">
                Phase {step.phase.number} · Lesson {step.lesson.number} · ~{formatMinutes(step.lesson.estimatedMinutes)}
              </p>
            </>
          ) : step?.kind === 'final' ? (
            <>
              <p className="text-[12px] text-subtle">Recommended next step</p>
              <a href={examHref(step.phase.id)} className="group mt-1 flex items-center gap-2">
                <GraduationCap className="size-4 shrink-0 text-accent" />
                <span className="truncate font-medium group-hover:text-accent-strong">Phase {step.phase.number} final exam</span>
              </a>
              <p className="mt-1 text-[13px] text-muted">You are regular in {step.phase.title}. Sit the final to complete the phase.</p>
            </>
          ) : step?.kind === 'checkpoint' ? (
            <>
              <p className="text-[12px] text-subtle">Recommended next step</p>
              <a href={checkpointHref(step.phase.id)} className="group mt-1 flex items-center gap-2">
                <Award className="size-4 shrink-0 text-accent" />
                <span className="truncate font-medium group-hover:text-accent-strong">Phase {step.phase.number} checkpoint</span>
              </a>
              <p className="mt-1 text-[13px] text-muted">All lessons done. Prove you understand {step.phase.title} to complete the phase.</p>
              {stepCheckpoint && (
                <p className="mt-2 text-[12px] text-subtle">
                  {stepCheckpoint.questionsTotal} questions
                  {stepCheckpoint.problemsTotal > 0 && ` · ${stepCheckpoint.problemsPassed}/${stepCheckpoint.problemsTotal} coding problems solved`}
                </p>
              )}
            </>
          ) : (
            <div className="flex items-start gap-3">
              <PartyPopper className="mt-0.5 size-5 text-accent" />
              <div>
                <p className="font-medium">Roadmap complete</p>
                <p className="text-[13px] text-muted">Every lesson, checkpoint and final is done. Keep building Lyra.</p>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {state.examPlan ? (
        nextFinal && (
          <a
            href={examHref(nextFinal.phase.id)}
            className={cx(
              'mb-4 flex items-center gap-3 rounded-xl border px-4 py-3 text-[13px] transition-colors hover:bg-surface-2',
              nextFinal.daysLeft <= 3 ? 'border-accent/40 bg-accent-soft/40' : 'border-line bg-surface',
            )}
          >
            <AlarmClock className={cx('size-4 shrink-0', nextFinal.daysLeft < 0 ? 'text-danger' : 'text-accent')} />
            <span className="min-w-0 flex-1">
              <span className="text-subtle">Next final: </span>
              <span className="font-medium">
                Phase {nextFinal.phase.number} · {nextFinal.phase.title}
              </span>
              <span className="text-subtle">
                {' '}
                · {sittingLabel(nextFinal.sitting)} by {fmtDate(nextFinal.deadline)} ({formatCountdown(nextFinal.daysLeft)})
              </span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-subtle" />
          </a>
        )
      ) : (
        <a href="#/exams" className="mb-4 flex items-center gap-3 rounded-xl border border-accent/40 bg-accent-soft/40 px-4 py-3 text-[13px] transition-colors hover:bg-surface-2">
          <GraduationCap className="size-4 shrink-0 text-accent" />
          <span className="min-w-0 flex-1">
            <span className="font-medium">Set up your final exams.</span>
            <span className="text-muted"> Pick your pace and get a deadline for every phase.</span>
          </span>
          <ArrowRight className="size-4 shrink-0 text-subtle" />
        </a>
      )}

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
