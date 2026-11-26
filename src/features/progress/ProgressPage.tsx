import { Award, BookCheck, CheckCircle2, Clock, Code2, Dumbbell, Flame, GraduationCap, Layers, Lock, Star } from 'lucide-react';
import { cx, Panel, PageHeader, ProgressBar, SectionTitle, StatTile } from '../../components/ui';
import { checkpoints } from '../../data/checkpoints';
import { allExerciseIds } from '../../data/curriculum';
import { habitMilestones, phaseMilestones, type MilestoneDefinition } from '../../data/milestones';
import { useAppState } from '../../hooks/useAppState';
import { phaseHref } from '../../hooks/useHashRoute';
import { addDays, formatDate, formatMinutes, formatWeekRange, todayKey, weekStartKey } from '../../lib/dates';
import { averageGrade } from '../../lib/exams';
import { currentStreak, getAllPhaseProgress, getOverallProgress, longestStreak, sessionsInWeek, totalMinutes } from '../../lib/progress';

const WEEKS_SHOWN = 8;

export function ProgressPage() {
  const { state } = useAppState();
  const overall = getOverallProgress(state);
  const phases = getAllPhaseProgress(state);
  const phasesDone = phases.filter((p) => p.status === 'completed').length;
  const minutes = totalMinutes(state.sessions);
  const exercisesDone = allExerciseIds.filter((id) => state.completedExercises[id]).length;
  const target = state.settings.weeklyHoursTarget * 60;
  const allProblems = Object.values(checkpoints).flatMap((c) => c.problems.map((p) => ({ phaseId: c.phaseId, id: p.id })));
  const avg = averageGrade(state);
  const problemsSolved = allProblems.filter((p) => state.checkpoints[p.phaseId]?.problems[p.id]?.passedAt).length;

  const thisWeek = weekStartKey(todayKey());
  const weeks = Array.from({ length: WEEKS_SHOWN }, (_, i) => {
    const key = addDays(thisWeek, -7 * (WEEKS_SHOWN - 1 - i));
    return { key, minutes: totalMinutes(sessionsInWeek(state.sessions, key)) };
  });
  const maxWeek = Math.max(target, ...weeks.map((w) => w.minutes));

  return (
    <>
      <PageHeader title="Progress" description="A clear view of how far you have come." />

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<Layers className="size-3.5" />} label="Overall completion" value={`${overall.percent}%`} hint={`${overall.lessonsCompleted} of ${overall.lessonsTotal} lessons`} />
        <StatTile icon={<BookCheck className="size-3.5" />} label="Completed lessons" value={overall.lessonsCompleted} hint={`${overall.lessonsTotal - overall.lessonsCompleted} to go`} />
        <StatTile icon={<Award className="size-3.5" />} label="Checkpoints passed" value={`${overall.checkpointsPassed} / ${overall.checkpointsTotal}`} />
        <StatTile icon={<GraduationCap className="size-3.5" />} label="Finals passed" value={`${overall.finalsPassed} / ${overall.finalsTotal}`} />
        <StatTile icon={<Star className="size-3.5" />} label="Average grade" value={avg === null ? '–' : avg.toFixed(2)} hint="Passed finals, 1–10" />
        <StatTile icon={<CheckCircle2 className="size-3.5" />} label="Completed phases" value={`${phasesDone} / ${phases.length}`} hint="Lessons + checkpoint + final" />
        <StatTile icon={<Code2 className="size-3.5" />} label="Coding problems solved" value={`${problemsSolved} / ${allProblems.length}`} />
        <StatTile icon={<Clock className="size-3.5" />} label="Study hours" value={formatMinutes(minutes)} hint={`${state.sessions.length} sessions logged`} />
        <StatTile icon={<Flame className="size-3.5" />} label="Current streak" value={`${currentStreak(state)}d`} hint={`Longest: ${longestStreak(state)} days`} />
        <StatTile icon={<Dumbbell className="size-3.5" />} label="Exercises done" value={`${exercisesDone} / ${allExerciseIds.length}`} />
      </div>

      <div className="mb-8 grid gap-6 grid-cols-1 lg:grid-cols-2">
        <section>
          <SectionTitle>Phase completion</SectionTitle>
          <Panel className="flex flex-col gap-4 p-5">
            {phases.map(({ phase, percent, lessonsCompleted, lessonsTotal, checkpointPassed, hasCheckpoint, hasFinal, finalPassed, status }) => (
              <a key={phase.id} href={phaseHref(phase.id)} className="group block">
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="truncate text-muted group-hover:text-fg">
                    <span className="text-subtle">{phase.number} · </span>
                    {phase.title}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 tabular-nums text-subtle">
                    {lessonsCompleted}/{lessonsTotal}
                    {hasCheckpoint && (
                      <Award className={cx('size-3.5', checkpointPassed ? 'text-success' : 'text-line-strong')} aria-label={checkpointPassed ? 'Checkpoint passed' : 'Checkpoint not passed'} />
                    )}
                    {hasFinal && (
                      <GraduationCap className={cx('size-3.5', finalPassed ? 'text-success' : 'text-line-strong')} aria-label={finalPassed ? 'Final passed' : 'Final not passed'} />
                    )}
                  </span>
                </div>
                <ProgressBar value={percent} tone={status === 'completed' ? 'success' : 'accent'} label={`${phase.title} progress`} />
              </a>
            ))}
          </Panel>
        </section>

        <section>
          <SectionTitle action={<span className="text-[12px] text-subtle">last {WEEKS_SHOWN} weeks</span>}>Weekly study hours</SectionTitle>
          <Panel className="p-5">
            <div className="relative flex h-48 items-end gap-2">
              <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line-strong" style={{ bottom: `${(target / maxWeek) * 100}%` }}>
                <span className="absolute -top-4 right-0 text-[10px] text-subtle">target</span>
              </div>
              {weeks.map((w) => (
                <div key={w.key} className="flex h-full flex-1 flex-col justify-end" title={`${formatWeekRange(w.key)}: ${formatMinutes(w.minutes)}`}>
                  <div
                    className={cx('w-full rounded-md transition-[height] duration-500', w.minutes >= target ? 'bg-accent' : 'bg-accent/45')}
                    style={{ height: `${Math.max(w.minutes > 0 ? 2 : 0, (w.minutes / maxWeek) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              {weeks.map((w) => (
                <span key={w.key} className={cx('flex-1 truncate text-center text-[10px] tabular-nums', w.key === thisWeek ? 'text-fg' : 'text-subtle')}>
                  {w.key === thisWeek ? 'Now' : `${Math.round(w.minutes / 6) / 10}h`}
                </span>
              ))}
            </div>
          </Panel>
        </section>
      </div>

      <section className="mb-6">
        <SectionTitle>Phase milestones</SectionTitle>
        <MilestoneGrid milestones={phaseMilestones} achievements={state.achievements} />
      </section>
      <section>
        <SectionTitle>Study habits</SectionTitle>
        <MilestoneGrid milestones={habitMilestones} achievements={state.achievements} />
      </section>
    </>
  );
}

function MilestoneGrid({ milestones, achievements }: { milestones: MilestoneDefinition[]; achievements: Record<string, string> }) {
  return (
    <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {milestones.map((m) => {
        const at = achievements[m.id];
        return (
          <li key={m.id} className={cx('flex items-start gap-3 rounded-xl border p-3.5', at ? 'border-accent/25 bg-accent-soft' : 'border-line bg-surface')}>
            <span className={cx('grid size-8 shrink-0 place-items-center rounded-lg', at ? 'bg-accent text-accent-ink' : 'bg-surface-3 text-subtle')}>
              {at ? <Award className="size-4" /> : <Lock className="size-3.5" />}
            </span>
            <span className="min-w-0">
              <span className={cx('block text-[13px] font-medium', !at && 'text-muted')}>{m.title}</span>
              <span className="block text-[12px] text-subtle">{at ? `Reached ${formatDate(at)}` : m.description}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
