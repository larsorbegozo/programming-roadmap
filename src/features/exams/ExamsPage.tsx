import { useState } from 'react';
import { CalendarClock, GraduationCap } from 'lucide-react';
import { Badge, Panel, PageHeader, StatTile, buttonClass, cx } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { examHref } from '../../hooks/useHashRoute';
import { PASS_PERCENT, averageGrade, formatCountdown, getExamTimeline, getNextFinal, sittingLabel, type UnitExam } from '../../lib/exams';
import { fmtDate } from './dates';
import { PlanSetup } from './PlanSetup';

export function UnitStatusBadge({ unit }: { unit: UnitExam }) {
  if (unit.status === 'passed') return <Badge tone="success">Passed · {unit.passedAttempt?.grade}</Badge>;
  if (unit.status === 'in-progress') return <Badge tone="accent">In progress</Badge>;
  const label = unit.sitting > 0 ? sittingLabel(unit.sitting) : unit.status === 'not-eligible' ? 'Not regular yet' : 'Open';
  return <Badge tone={unit.sitting >= 2 ? 'neutral' : unit.status === 'available' ? 'accent' : 'neutral'}>{label}</Badge>;
}

export function ExamsPage() {
  const { state } = useAppState();
  const [replanning, setReplanning] = useState(false);

  if (!state.examPlan || replanning) {
    return (
      <>
        <PageHeader
          title={replanning ? 'Re-plan your exam calendar' : 'Set up your final exams'}
          description="Every phase ends with a timed final exam and a deadline, like university. Pick your pace and the app calculates the dates."
        />
        {!replanning && (
          <Panel className="mb-5 p-5 text-[13px] text-muted">
            <p className="mb-2 font-medium text-fg">How it works</p>
            <ul className="flex list-disc flex-col gap-1 pl-5 marker:text-subtle">
              <li>To sit a final you must be <span className="text-fg">regular</span>: every lesson done and the checkpoint passed. The previous phase’s final is a prerequisite.</li>
              <li>Each final is timed, has new questions and coding problems, and allows one attempt per sitting. Code is graded with hidden tests.</li>
              <li>Grades go from 1 to 10. You pass with a 4 ({PASS_PERCENT}%).</li>
              <li>Fail or miss the deadline: you get a retake one week later. Fail the retake: the phase goes <span className="text-fg">libre</span>, a new sitting opens every week, and the rest of the calendar moves back a week.</li>
            </ul>
          </Panel>
        )}
        <PlanSetup replanning={replanning} onDone={replanning ? () => setReplanning(false) : undefined} />
      </>
    );
  }

  const timeline = getExamTimeline(state);
  const next = getNextFinal(state);
  const passed = timeline.filter((u) => u.status === 'passed').length;
  const avg = averageGrade(state);
  const shifted = timeline.reduce((max, u) => Math.max(max, u.shiftWeeks), 0);

  return (
    <>
      <PageHeader
        title="Final exams"
        description={`${state.examPlan.hoursPerWeek} h per week · started ${fmtDate(state.examPlan.startDate)}`}
        actions={
          <button type="button" onClick={() => setReplanning(true)} className={buttonClass('secondary', 'sm')}>
            <CalendarClock className="size-4" /> Re-plan
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={<GraduationCap className="size-3.5" />} label="Finals passed" value={`${passed} / ${timeline.length}`} />
        <StatTile label="Average grade" value={avg === null ? '–' : avg.toFixed(2)} hint="Passed finals only" />
        <StatTile label="Next deadline" value={next ? fmtDate(next.deadline) : '–'} hint={next ? `Phase ${next.phase.number} · ${formatCountdown(next.daysLeft)}` : 'All finals passed'} />
        <StatTile label="Calendar delay" value={shifted === 0 ? 'On time' : `+${shifted} week${shifted === 1 ? '' : 's'}`} hint="From libre phases" />
      </div>

      <Panel className="overflow-hidden">
        <ol className="divide-y divide-line">
          {timeline.map((unit) => {
            const isNext = next?.phase.id === unit.phase.id;
            const overdue = unit.status !== 'passed' && unit.daysLeft < 0;
            return (
              <li key={unit.phase.id} className={cx('flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:px-5', isNext && 'bg-accent-soft/40')}>
                <span
                  className={cx(
                    'grid size-9 shrink-0 place-items-center rounded-lg border text-[13px] font-semibold tabular-nums',
                    unit.status === 'passed' ? 'border-success/30 bg-success/10 text-success' : isNext ? 'border-accent/40 bg-accent-soft text-accent-strong' : 'border-line-strong text-muted',
                  )}
                >
                  {unit.phase.number}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{unit.phase.title}</span>
                    <UnitStatusBadge unit={unit} />
                  </div>
                  <p className="mt-1 text-[12px] text-subtle">
                    Study {fmtDate(unit.start)} → {fmtDate(unit.firstDeadline)} · Retake {fmtDate(unit.retakeDeadline)}
                    {unit.shiftWeeks > 0 && ` · moved ${unit.shiftWeeks} wk`}
                  </p>
                  {unit.status === 'not-eligible' && isNext && <p className="mt-1 text-[12px] text-muted">To sit it: {unit.blockers.join(' · ')}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                  {unit.status === 'passed' ? (
                    <span className="text-[13px] text-success">Grade {unit.passedAttempt?.grade} · {unit.passedAttempt?.percent}%</span>
                  ) : (
                    <span className={cx('text-[13px] tabular-nums', overdue ? 'text-danger' : isNext ? 'text-fg' : 'text-muted')}>
                      {sittingLabel(unit.sitting)} by {fmtDate(unit.deadline)}
                      <span className="text-subtle"> · {formatCountdown(unit.daysLeft)}</span>
                    </span>
                  )}
                  <a href={examHref(unit.phase.id)} className="text-[12px] text-accent hover:text-accent-strong">
                    {unit.status === 'passed' ? 'See results' : unit.status === 'in-progress' ? 'Continue exam' : 'Exam details'}
                  </a>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </>
  );
}
