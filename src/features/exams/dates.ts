import { formatDay } from '../../lib/dates';

export const fmtDate = (key: string) => formatDay(key, { weekday: 'short', day: 'numeric', month: 'short' });
export const fmtDateYear = (key: string) => formatDay(key, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
