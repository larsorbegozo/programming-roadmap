import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Check } from 'lucide-react';
import type { Difficulty } from '../types/curriculum';

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export function Panel({ children, className, as: Tag = 'section' }: { children: ReactNode; className?: string; as?: 'section' | 'div' | 'article' }) {
  return <Tag className={cx('rounded-xl border border-line bg-surface', className)}>{children}</Tag>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="text-[13px] font-medium uppercase tracking-wide text-subtle">{children}</h2>
      {action}
    </div>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-ink hover:bg-accent-strong font-medium',
  secondary: 'border border-line-strong bg-surface-2 text-fg hover:bg-surface-3',
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  danger: 'border border-danger/40 bg-danger-soft text-danger hover:bg-danger/20',
};

export function buttonClass(variant: ButtonVariant = 'secondary', size: 'sm' | 'md' = 'md') {
  return cx(
    'inline-flex items-center justify-center gap-2 rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50',
    size === 'sm' ? 'h-8 px-3 text-[13px]' : 'h-9 px-4',
    buttonStyles[variant],
  );
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: 'sm' | 'md' }) {
  return <button type={type} className={cx(buttonClass(variant, size), className)} {...props} />;
}

export function ProgressBar({ value, className, tone = 'accent', label }: { value: number; className?: string; tone?: 'accent' | 'success' | string; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = tone === 'accent' ? 'var(--color-accent)' : tone === 'success' ? 'var(--color-success)' : tone;
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cx('h-1.5 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${clamped}%`, background: color }} />
    </div>
  );
}

export function ProgressRing({ value, size = 96, stroke = 7, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  size = 'md',
  disabled,
  title,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      title={title}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) onChange();
      }}
      className={cx(
        'grid shrink-0 place-items-center rounded-md border transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        size === 'sm' ? 'size-4' : 'size-5',
        checked ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong bg-surface-2 hover:border-accent/60',
      )}
    >
      {checked && <Check className={size === 'sm' ? 'size-3' : 'size-3.5'} strokeWidth={3} />}
    </button>
  );
}

export function Badge({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'accent' | 'success'; className?: string }) {
  const tones = {
    neutral: 'border-line-strong text-muted',
    accent: 'border-accent/30 bg-accent-soft text-accent-strong',
    success: 'border-success/30 bg-success/10 text-success',
  };
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-1.5 py-0.5 text-[11px] font-medium', tones[tone], className)}>{children}</span>;
}

const difficultyLabel: Record<Difficulty, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const bars = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-subtle" title={`Difficulty: ${difficultyLabel[difficulty]}`}>
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={cx('w-[3px] rounded-sm', i <= bars ? 'bg-muted' : 'bg-line-strong')} style={{ height: 4 + i * 2 }} />
        ))}
      </span>
      {difficultyLabel[difficulty]}
    </span>
  );
}

export function StatTile({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-2 text-[12px] text-subtle">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && <div className="mt-0.5 truncate text-[12px] text-muted">{hint}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line-strong px-6 py-10 text-center">
      {icon && <div className="mb-3 text-subtle">{icon}</div>}
      <p className="font-medium text-fg">{title}</p>
      {description && <p className="mt-1 max-w-sm text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SegmentedControl<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx('h-7 rounded-md px-2.5 text-[13px] transition-colors', value === o.value ? 'bg-surface-3 text-fg' : 'text-subtle hover:text-fg')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export const inputClass =
  'h-9 w-full rounded-lg border border-line-strong bg-surface-2 px-3 text-fg placeholder:text-subtle transition-colors focus:border-accent/70 focus:outline-none';
