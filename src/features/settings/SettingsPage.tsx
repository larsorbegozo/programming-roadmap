import { useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { Download, RotateCcw, Upload } from 'lucide-react';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Button, Panel, PageHeader, inputClass } from '../../components/ui';
import { useAppState } from '../../hooks/useAppState';
import { todayKey } from '../../lib/dates';
import { weeklyAllocation } from '../../lib/progress';
import { buildExport, downloadFile } from '../../lib/storage';
import { MAX_WEEKLY_HOURS, MIN_WEEKLY_HOURS, validateState } from '../../lib/validation';
import type { AppState } from '../../types/state';

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;

function Row({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-[13px] text-muted">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SettingsPage() {
  const { state, dispatch } = useAppState();
  const [hours, setHours] = useState(String(state.settings.weeklyHoursTarget));
  const [hoursMessage, setHoursMessage] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<{ state: AppState; warnings: string[]; fileName: string } | null>(null);
  const [importErrors, setImportErrors] = useState<string[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const parsedHours = Number(hours);
  const hoursValid = Number.isInteger(parsedHours) && parsedHours >= MIN_WEEKLY_HOURS && parsedHours <= MAX_WEEKLY_HOURS;
  const preview = hoursValid ? weeklyAllocation(parsedHours) : null;

  const saveHours = () => {
    if (!hoursValid) {
      setHoursMessage({ tone: 'error', text: `Enter a whole number between ${MIN_WEEKLY_HOURS} and ${MAX_WEEKLY_HOURS}.` });
      return;
    }
    dispatch({ type: 'updateSettings', settings: { weeklyHoursTarget: parsedHours } });
    setHoursMessage({ tone: 'ok', text: 'Saved.' });
  };

  const exportProgress = () => {
    downloadFile(`lyra-roadmap-progress-${todayKey()}.json`, buildExport(state));
    setNotice('Progress exported.');
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setImportErrors(null);
    setNotice(null);
    if (!file) return;
    if (file.size > MAX_IMPORT_BYTES) return setImportErrors(['The file is too large to be a progress export.']);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const result = validateState(parsed);
      if (!result.ok) return setImportErrors(result.errors);
      setPendingImport({ state: result.state, warnings: result.warnings, fileName: file.name });
    } catch {
      setImportErrors(['The file is not valid JSON.']);
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    dispatch({ type: 'replaceState', state: pendingImport.state });
    setHours(String(pendingImport.state.settings.weeklyHoursTarget));
    setPendingImport(null);
    setNotice('Progress imported successfully.');
  };

  const confirmReset = () => {
    dispatch({ type: 'reset' });
    setHours('10');
    setResetOpen(false);
    setNotice('All progress has been reset.');
  };

  const importSummary = pendingImport && {
    lessons: Object.keys(pendingImport.state.completedLessons).length,
    sessions: pendingImport.state.sessions.length,
    notes: Object.keys(pendingImport.state.notes).length,
  };

  return (
    <>
      <PageHeader title="Settings" description="Your progress is stored in this browser only. Export a backup regularly." />

      {notice && (
        <div role="status" className="mb-4 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-[13px] text-success">
          {notice}
        </div>
      )}

      <Panel className="mb-6 divide-y divide-line">
        <Row
          title="Weekly study target"
          description={preview ? `Splits into ${preview.theory}h theory, ${preview.practice}h practice and ${preview.revision}h revision.` : 'Hours you plan to study each week.'}
        >
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveHours();
            }}
          >
            <input
              type="number"
              min={MIN_WEEKLY_HOURS}
              max={MAX_WEEKLY_HOURS}
              step={1}
              value={hours}
              onChange={(e) => {
                setHours(e.target.value);
                setHoursMessage(null);
              }}
              className={`${inputClass} w-20 text-right tabular-nums`}
              aria-label="Weekly study hours"
              aria-invalid={!hoursValid}
            />
            <span className="text-[13px] text-muted">h / week</span>
            <Button type="submit" variant="primary" size="sm" disabled={!hoursValid || parsedHours === state.settings.weeklyHoursTarget}>
              Save
            </Button>
          </form>
          {hoursMessage && <p className={`mt-1.5 text-right text-[12px] ${hoursMessage.tone === 'ok' ? 'text-success' : 'text-danger'}`}>{hoursMessage.text}</p>}
        </Row>
      </Panel>

      <Panel className="mb-6 divide-y divide-line">
        <Row title="Export progress" description="Download all lessons, checkpoint results, code, notes, sessions and settings as a JSON file.">
          <Button onClick={exportProgress}>
            <Download className="size-4" /> Export JSON
          </Button>
        </Row>
        <div>
          <Row title="Import progress" description="Restore from a previously exported file. This replaces your current progress.">
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
            <Button onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Import JSON
            </Button>
          </Row>
          {importErrors && (
            <div role="alert" className="mx-5 mb-5 rounded-lg border border-danger/40 bg-danger-soft px-4 py-3 text-[13px] text-danger">
              <p className="font-medium">This file can't be imported:</p>
              <ul className="mt-1 list-disc pl-5">
                {importErrors.map((err) => (
                  <li key={err}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Panel>

      <Panel className="border-danger/25">
        <Row title="Reset progress" description="Permanently delete all completed lessons, checkpoint and exam results, your exam calendar, code, notes, sessions and settings from this browser.">
          <Button variant="danger" onClick={() => setResetOpen(true)}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        </Row>
      </Panel>

      <ConfirmDialog open={resetOpen} title="Reset all progress?" confirmLabel="Reset everything" tone="danger" onConfirm={confirmReset} onCancel={() => setResetOpen(false)}>
        This deletes every completed lesson, checkpoint and exam result, your exam calendar, saved code, notes, study sessions and settings. It cannot be undone. Consider exporting a backup first.
      </ConfirmDialog>

      <ConfirmDialog open={pendingImport !== null} title="Replace current progress?" confirmLabel="Import" onConfirm={confirmImport} onCancel={() => setPendingImport(null)}>
        {pendingImport && importSummary && (
          <>
            <p>
              <span className="text-fg">{pendingImport.fileName}</span> contains {importSummary.lessons} completed lessons, {importSummary.sessions} study sessions and {importSummary.notes} notes. Your current progress will be replaced.
            </p>
            {pendingImport.warnings.length > 0 && (
              <ul className="mt-3 list-disc pl-5 text-[12px] text-subtle">
                {pendingImport.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </ConfirmDialog>
    </>
  );
}
