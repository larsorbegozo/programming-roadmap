import { useState, type FormEvent } from 'react';
import { Plus } from 'lucide-react';
import { Button, inputClass } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { CATEGORY_LABEL } from '../../lib/progress';
import { createId } from '../../lib/storage';
import { isValidDateKey } from '../../lib/dates';
import { MAX_SESSION_MINUTES } from '../../lib/validation';
import type { StudyCategory } from '../../types/state';
import { CATEGORIES } from './categories';

export function SessionForm({ defaultDate }: { defaultDate: string }) {
  const { dispatch } = useAppState();
  const [date, setDate] = useState(defaultDate);
  const [category, setCategory] = useState<StudyCategory>('theory');
  const [minutes, setMinutes] = useState('60');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(minutes);
    if (!isValidDateKey(date)) return setError('Choose a valid date.');
    if (!Number.isFinite(value) || value < 1 || value > MAX_SESSION_MINUTES) return setError(`Minutes must be between 1 and ${MAX_SESSION_MINUTES}.`);
    dispatch({ type: 'addSession', session: { id: createId(), date, category, minutes: Math.round(value), ...(note.trim() ? { note: note.trim() } : {}) } });
    setNote('');
    setError(null);
  };

  return (
    <form onSubmit={submit} className="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(3,minmax(0,1fr))_auto] sm:items-end">
      <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} required />
      </label>
      <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
        Type
        <select value={category} onChange={(e) => setCategory(e.target.value as StudyCategory)} className={inputClass}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABEL[c]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-[12px] text-subtle">
        Minutes
        <input type="number" inputMode="numeric" min={1} max={MAX_SESSION_MINUTES} step={1} value={minutes} onChange={(e) => setMinutes(e.target.value)} className={inputClass} required />
      </label>
      <Button type="submit" variant="primary" className="sm:mb-0">
        <Plus className="size-4" /> Log session
      </Button>
      <label className="flex flex-col gap-1.5 text-[12px] text-subtle sm:col-span-4">
        Note (optional)
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you work on?" className={inputClass} maxLength={200} />
      </label>
      {error && (
        <p role="alert" className="text-[13px] text-danger sm:col-span-4">
          {error}
        </p>
      )}
    </form>
  );
}
