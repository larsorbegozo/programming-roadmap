import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { InlineText, RichText } from '../../components/RichText';
import { Button, Panel, cx, inputClass } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { lessonHref } from '../../hooks/useHashRoute';
import { QUIZ_PASS_PERCENT } from '../../lib/progress';
import { isAnswered, isCorrect, shuffledIndexes, type QuizAnswer } from '../../lib/quiz';
import type { Phase } from '../../types/curriculum';
import type { Question } from '../../types/checkpoint';

interface QuizSectionProps {
  phase: Phase;
  questions: Question[];
}

interface Attempt {
  orders: Record<string, number[]>;
  answers: Record<string, QuizAnswer>;
  submitted: boolean;
  score: number;
}

function newAttempt(questions: Question[]): Attempt {
  const orders: Record<string, number[]> = {};
  for (const q of questions) if (q.kind !== 'text') orders[q.id] = shuffledIndexes(q.options.length);
  return { orders, answers: {}, submitted: false, score: 0 };
}

export function QuizSection({ phase, questions }: QuizSectionProps) {
  const { state, dispatch } = useAppState();
  const saved = state.checkpoints[phase.id]?.quiz;
  const [attempt, setAttempt] = useState(() => newAttempt(questions));
  const everPassed = Boolean(saved?.passedAt);

  const answeredCount = questions.filter((q) => isAnswered(q, attempt.answers[q.id])).length;
  const results = useMemo(
    () => (attempt.submitted ? Object.fromEntries(questions.map((q) => [q.id, isCorrect(q, attempt.answers[q.id])])) : {}),
    [attempt, questions],
  );
  const correctCount = Object.values(results).filter(Boolean).length;
  const showExplanations = attempt.submitted && (everPassed || attempt.score >= QUIZ_PASS_PERCENT);

  const setAnswer = (id: string, answer: QuizAnswer) => {
    if (attempt.submitted) return;
    setAttempt((a) => ({ ...a, answers: { ...a.answers, [id]: answer } }));
  };

  const submit = () => {
    const correct = questions.filter((q) => isCorrect(q, attempt.answers[q.id])).length;
    const score = Math.round((correct / questions.length) * 100);
    setAttempt((a) => ({ ...a, submitted: true, score }));
    dispatch({ type: 'recordQuiz', phaseId: phase.id, score, passed: score >= QUIZ_PASS_PERCENT });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const retry = () => {
    setAttempt(newAttempt(questions));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col gap-4">
      {attempt.submitted ? (
        <Panel className={cx('flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between', attempt.score >= QUIZ_PASS_PERCENT ? 'border-success/40' : 'border-danger/40')}>
          <div>
            <p className={cx('text-lg font-semibold', attempt.score >= QUIZ_PASS_PERCENT ? 'text-success' : 'text-danger')}>
              {attempt.score}% · {correctCount} of {questions.length} correct
            </p>
            <p className="mt-0.5 text-[13px] text-muted">
              {attempt.score >= QUIZ_PASS_PERCENT
                ? 'Passed. Read the explanations below to consolidate what you learned.'
                : `You need ${QUIZ_PASS_PERCENT}% to pass. Review the lessons linked next to the wrong answers, then try again. Options are reshuffled on every attempt.`}
            </p>
          </div>
          <Button onClick={retry} className="shrink-0">
            <RotateCcw className="size-4" /> {attempt.score >= QUIZ_PASS_PERCENT ? 'Retake' : 'Try again'}
          </Button>
        </Panel>
      ) : (
        <p className="text-[13px] text-muted">
          {questions.length} questions. Score at least {QUIZ_PASS_PERCENT}% to pass.
          {saved && ` Best score so far: ${saved.bestScore}% (${saved.attempts} attempt${saved.attempts === 1 ? '' : 's'}).`}
          {' '}Wrong answers are not revealed until you pass, so each attempt really tests what you know.
        </p>
      )}

      <ol className="flex flex-col gap-3">
        {questions.map((q, index) => {
          const answer = attempt.answers[q.id];
          const correct = results[q.id];
          const lesson = q.lesson ? phase.lessons[q.lesson - 1] : undefined;
          return (
            <li key={q.id}>
              <Panel as="div" className={cx('p-4 sm:p-5', attempt.submitted && (correct ? 'border-success/30' : 'border-danger/30'))}>
                <div className="flex gap-3">
                  <span className="mt-0.5 w-6 shrink-0 text-[13px] tabular-nums text-subtle">{index + 1}.</span>
                  <div className="min-w-0 flex-1">
                    <RichText text={q.prompt} className="text-fg" />
                    {q.kind === 'multi' && <p className="mt-1 text-[12px] text-subtle">Select all that apply.</p>}

                    <div className="mt-3">
                      {q.kind === 'text' ? (
                        <input
                          type="text"
                          value={typeof answer === 'string' ? answer : ''}
                          onChange={(e) => setAnswer(q.id, e.target.value)}
                          disabled={attempt.submitted}
                          placeholder={q.placeholder ?? 'Your answer'}
                          aria-label={`Answer to question ${index + 1}`}
                          autoCapitalize="off"
                          autoCorrect="off"
                          spellCheck={false}
                          className={cx(inputClass, 'font-mono text-[13px] disabled:opacity-80')}
                        />
                      ) : (
                        <div role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-label={`Options for question ${index + 1}`} className="flex flex-col gap-1.5">
                          {(attempt.orders[q.id] ?? []).map((optionIndex) => {
                            const selected = q.kind === 'single' ? answer === optionIndex : Array.isArray(answer) && answer.includes(optionIndex);
                            return (
                              <button
                                key={optionIndex}
                                type="button"
                                role={q.kind === 'single' ? 'radio' : 'checkbox'}
                                aria-checked={selected}
                                disabled={attempt.submitted}
                                onClick={() => {
                                  if (q.kind === 'single') setAnswer(q.id, optionIndex);
                                  else {
                                    const current = Array.isArray(answer) ? answer : [];
                                    setAnswer(q.id, selected ? current.filter((v) => v !== optionIndex) : [...current, optionIndex]);
                                  }
                                }}
                                className={cx(
                                  'flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-[13.5px] transition-colors disabled:cursor-default',
                                  selected ? 'border-accent/60 bg-accent-soft text-fg' : 'border-line hover:border-line-strong hover:bg-surface-2',
                                )}
                              >
                                <span
                                  className={cx(
                                    'mt-0.5 grid size-4 shrink-0 place-items-center border',
                                    q.kind === 'single' ? 'rounded-full' : 'rounded',
                                    selected ? 'border-accent bg-accent' : 'border-line-strong',
                                  )}
                                >
                                  {selected && <span className={cx('bg-accent-ink', q.kind === 'single' ? 'size-1.5 rounded-full' : 'size-2 rounded-[2px]')} />}
                                </span>
                                <InlineText text={q.options[optionIndex] ?? ''} />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {attempt.submitted && (
                      <div className={cx('mt-3 rounded-lg px-3 py-2.5 text-[13px]', correct ? 'bg-success/10' : 'bg-danger-soft')}>
                        <p className={cx('flex items-center gap-1.5 font-medium', correct ? 'text-success' : 'text-danger')}>
                          {correct ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                          {correct ? 'Correct' : 'Not quite'}
                        </p>
                        {(correct || showExplanations) && <RichText text={q.explanation} className="mt-1 text-muted" />}
                        {!correct && lesson && (
                          <p className="mt-1 text-muted">
                            Review{' '}
                            <a href={lessonHref(lesson.id)} className="text-accent hover:text-accent-strong">
                              Lesson {lesson.number}: {lesson.title}
                            </a>
                            .
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </li>
          );
        })}
      </ol>

      {!attempt.submitted && (
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-subtle">
            {answeredCount} of {questions.length} answered
          </p>
          <Button variant="primary" onClick={submit} disabled={answeredCount < questions.length}>
            Submit answers
          </Button>
        </div>
      )}
    </div>
  );
}
