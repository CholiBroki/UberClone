// AI-assisted: see docs/AI_LOG.md #23
import { startOfDay, startOfWeek, startOfMonth } from './earnings';
import { parseLocalDate } from './dateUtils';

export const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const getBounds = (period, range = {}, now = new Date()) => {
  switch (period) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'week':
      return { from: startOfWeek(now), to: endOfDay(now) };
    case 'month':
      return { from: startOfMonth(now), to: endOfDay(now) };
    case 'range': {
      if (!range.from || !range.to) return null;
      const from = parseLocalDate(range.from);
      const to = endOfDay(parseLocalDate(range.to));
      return from > to ? null : { from, to };
    }
    default:
      return null;
  }
};

export const isRangeIncomplete = (period, range = {}) =>
  period === 'range' && (!range.from || !range.to);

export const isRangeInvalid = (period, range = {}) =>
  period === 'range' && !!range.from && !!range.to && getBounds(period, range) === null;

export const formatDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};