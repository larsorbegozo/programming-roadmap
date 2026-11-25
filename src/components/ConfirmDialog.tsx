import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './ui';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  tone?: 'danger' | 'primary';
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, children, confirmLabel, tone = 'primary', confirmDisabled, onConfirm, onCancel }: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel();
      }}
      className="m-auto w-[min(440px,calc(100vw-32px))] rounded-xl border border-line-strong bg-surface p-0 text-fg backdrop:bg-black/60 backdrop:backdrop-blur-[2px]"
    >
      <div className="p-5">
        <h2 className="text-base font-semibold">{title}</h2>
        <div className="mt-2 text-muted">{children}</div>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={confirmDisabled}>
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
