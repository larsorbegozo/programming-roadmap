import { CheckCircle2, XCircle } from 'lucide-react';
import { InlineText, RichText } from '../../components/RichText';
import { Panel, cx, inputClass } from '../../components/ui';
import { lessonHref } from '../../hooks/useHashRoute';
import type { QuizAnswer } from '../../lib/quiz';
import type { Question } from '../../types/checkpoint';
import type { Lesson } from '../../types/curriculum';

interface QuestionCardProps {
  question: Question;
  index: number;
  answer: QuizAnswer;
  /** Display order of the options (indexes into question.options). */
  order: number[];
  onAnswer: (answer: QuizAnswer) => void;
  disabled?: boolean;
  /** Set after grading. */
  result?: { correct: boolean; showExplanation: boolean; lesson?: Lesson };
}

export function QuestionCard({ question: q, index, answer, order, onAnswer, disabled, result }: QuestionCardProps) {
  return (
    <Panel as="div" className={cx('p-4 sm:p-5', result && (result.correct ? 'border-success/30' : 'border-danger/30'))}>
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
                onChange={(e) => onAnswer(e.target.value)}
                disabled={disabled}
                placeholder={q.placeholder ?? 'Your answer'}
                aria-label={`Answer to question ${index + 1}`}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                className={cx(inputClass, 'font-mono text-[13px] disabled:opacity-80')}
              />
            ) : (
              <div role={q.kind === 'single' ? 'radiogroup' : 'group'} aria-label={`Options for question ${index + 1}`} className="flex flex-col gap-1.5">
                {order.map((optionIndex) => {
                  const selected = q.kind === 'single' ? answer === optionIndex : Array.isArray(answer) && answer.includes(optionIndex);
                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      role={q.kind === 'single' ? 'radio' : 'checkbox'}
                      aria-checked={selected}
                      disabled={disabled}
                      onClick={() => {
                        if (q.kind === 'single') onAnswer(optionIndex);
                        else {
                          const current = Array.isArray(answer) ? answer : [];
                          onAnswer(selected ? current.filter((v) => v !== optionIndex) : [...current, optionIndex]);
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

          {result && (
            <div className={cx('mt-3 rounded-lg px-3 py-2.5 text-[13px]', result.correct ? 'bg-success/10' : 'bg-danger-soft')}>
              <p className={cx('flex items-center gap-1.5 font-medium', result.correct ? 'text-success' : 'text-danger')}>
                {result.correct ? <CheckCircle2 className="size-4" /> : <XCircle className="size-4" />}
                {result.correct ? 'Correct' : 'Not quite'}
              </p>
              {(result.correct || result.showExplanation) && <RichText text={q.explanation} className="mt-1 text-muted" />}
              {!result.correct && result.lesson && (
                <p className="mt-1 text-muted">
                  Review{' '}
                  <a href={lessonHref(result.lesson.id)} className="text-accent hover:text-accent-strong">
                    Lesson {result.lesson.number}: {result.lesson.title}
                  </a>
                  .
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
