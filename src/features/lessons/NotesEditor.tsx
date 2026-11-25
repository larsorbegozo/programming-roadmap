import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useAppState } from '../../hooks/useAppState';

const SAVE_DELAY = 400;

export function NotesEditor({ lessonId }: { lessonId: string }) {
  const { state, dispatch } = useAppState();
  const saved = state.notes[lessonId] ?? '';
  const [text, setText] = useState(saved);
  const [status, setStatus] = useState<'idle' | 'pending' | 'saved'>('idle');
  const pending = useRef<{ id: string; text: string } | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const flush = () => {
    window.clearTimeout(timer.current);
    if (pending.current) {
      dispatch({ type: 'setNote', lessonId: pending.current.id, text: pending.current.text });
      pending.current = null;
      setStatus('saved');
    }
  };

  // Reset when switching lessons, saving anything pending for the previous one.
  useEffect(() => {
    setText(state.notes[lessonId] ?? '');
    setStatus('idle');
    return flush;
  }, [lessonId]);

  const onChange = (value: string) => {
    setText(value);
    setStatus('pending');
    pending.current = { id: lessonId, text: value };
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, SAVE_DELAY);
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        onBlur={flush}
        rows={6}
        placeholder="What did you learn? What was confusing? Write code snippets, questions, or links…"
        aria-label="Personal notes"
        className="w-full resize-y rounded-lg border border-line-strong bg-surface-2 px-3 py-2.5 leading-relaxed text-fg placeholder:text-subtle focus:border-accent/70 focus:outline-none"
      />
      <div className="mt-1.5 flex h-4 items-center justify-end text-[12px] text-subtle" aria-live="polite">
        {status === 'pending' && 'Saving…'}
        {status === 'saved' && (
          <span className="inline-flex items-center gap-1">
            <Check className="size-3" /> Saved
          </span>
        )}
      </div>
    </div>
  );
}
