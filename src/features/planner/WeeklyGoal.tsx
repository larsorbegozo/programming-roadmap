import { useEffect, useState } from 'react';
import { Pencil, RotateCcw } from 'lucide-react';
import { Button, inputClass } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { suggestedWeeklyObjective } from '../../lib/progress';

/** Shows (and lets the user edit) the objective for a given week. Falls back to an auto-suggestion. */
export function WeeklyGoal({ weekKey, editable = true }: { weekKey: string; editable?: boolean }) {
  const { state, dispatch } = useAppState();
  const custom = state.weeklyGoals[weekKey];
  const suggestion = suggestedWeeklyObjective(state);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(custom ?? suggestion);

  useEffect(() => {
    setEditing(false);
  }, [weekKey]);

  if (editing) {
    return (
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          dispatch({ type: 'setWeeklyGoal', weekKey, text: draft });
          setEditing(false);
        }}
      >
        <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} className={inputClass} maxLength={200} aria-label="Weekly objective" />
        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm">
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <p className="text-fg">
        {custom ?? suggestion}
        {!custom && <span className="ml-2 text-[12px] text-subtle">(suggested)</span>}
      </p>
      {editable && (
        <div className="flex shrink-0 gap-1">
          {custom && (
            <button type="button" onClick={() => dispatch({ type: 'setWeeklyGoal', weekKey, text: '' })} className="rounded-md p-1.5 text-subtle hover:bg-surface-2 hover:text-fg" aria-label="Use suggested objective" title="Use suggested objective">
              <RotateCcw className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setDraft(custom ?? suggestion);
              setEditing(true);
            }}
            className="rounded-md p-1.5 text-subtle hover:bg-surface-2 hover:text-fg"
            aria-label="Edit weekly objective"
            title="Edit weekly objective"
          >
            <Pencil className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
