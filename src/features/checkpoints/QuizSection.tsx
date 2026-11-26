import { useMemo, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, Panel, cx } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { QUIZ_PASS_PERCENT } from '../../lib/progress';
import { isAnswered, isCorrect, shuffledIndexes, type QuizAnswer } from '../../lib/quiz';
import type { Phase } from '../../types/curriculum';
import type { Question } from '../../types/checkpoint';
import { QuestionCard } from './QuestionCard';

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
        {questions.map((q, index) => (
          <li key={q.id}>
            <QuestionCard
              question={q}
              index={index}
              answer={attempt.answers[q.id]}
              order={attempt.orders[q.id] ?? []}
              onAnswer={(a) => setAnswer(q.id, a)}
              disabled={attempt.submitted}
              result={
                attempt.submitted
                  ? { correct: Boolean(results[q.id]), showExplanation: showExplanations, lesson: q.lesson ? phase.lessons[q.lesson - 1] : undefined }
                  : undefined
              }
            />
          </li>
        ))}
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
