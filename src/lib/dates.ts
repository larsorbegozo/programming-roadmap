/** Date helpers that work in the user's local time zone using YYYY-MM-DD keys. */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** Monday of the week containing the given date. */
export function weekStartKey(key: string): string {
  const date = fromDateKey(key);
  const offset = (date.getDay() + 6) % 7; // Monday = 0
  date.setDate(date.getDate() - offset);
  return toDateKey(date);
}

export function weekDays(weekKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekKey, i));
}

export function isValidDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return toDateKey(fromDateKey(value)) === value;
}

export function formatWeekRange(weekKey: string): string {
  const start = fromDateKey(weekKey);
  const end = fromDateKey(addDays(weekKey, 6));
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function formatDay(key: string, options: Intl.DateTimeFormatOptions = { weekday: 'short' }): string {
  return new Intl.DateTimeFormat(undefined, options).format(fromDateKey(key));
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
