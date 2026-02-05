import {
  format,
  formatDuration,
  intervalToDuration,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfQuarter,
  parseISO,
  isValid,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  addDays,
  subDays,
  isSameDay,
  isToday,
  isYesterday,
  getDay,
  getHours,
  getMinutes,
  type Locale,
} from 'date-fns';
import { ru, enUS, he } from 'date-fns/locale';

// Locale mapping
const locales: Record<string, Locale> = {
  ru,
  en: enUS,
  he,
};

export function getLocale(lang: string = 'ru'): Locale {
  return locales[lang] || ru;
}

// Date parsing
export function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  const parsed = parseISO(date);
  return isValid(parsed) ? parsed : new Date(date);
}

// Format date as ISO date string (YYYY-MM-DD)
export function toDateKey(date: Date | string): string {
  const d = parseDate(date);
  return format(d, 'yyyy-MM-dd');
}

// Format time of day (HH:mm)
export function formatTimeOfDay(date: Date | string): string {
  const d = parseDate(date);
  return format(d, 'HH:mm');
}

// Format time of day with seconds (HH:mm:ss)
export function formatTimeOfDayFull(date: Date | string): string {
  const d = parseDate(date);
  return format(d, 'HH:mm:ss');
}

// Format date for display (localized)
export function formatDisplayDate(date: Date | string, lang: string = 'ru'): string {
  const d = parseDate(date);
  return format(d, 'EEEE, d MMMM', { locale: getLocale(lang) });
}

// Format date short (d MMM)
export function formatShortDate(date: Date | string, lang: string = 'ru'): string {
  const d = parseDate(date);
  return format(d, 'd MMM', { locale: getLocale(lang) });
}

// Format date with year
export function formatFullDate(date: Date | string, lang: string = 'ru'): string {
  const d = parseDate(date);
  return format(d, 'PPP', { locale: getLocale(lang) });
}

// Format weekday name
export function formatWeekday(date: Date | string, lang: string = 'ru'): string {
  const d = parseDate(date);
  return format(d, 'EEEE', { locale: getLocale(lang) });
}

// Format weekday short
export function formatWeekdayShort(date: Date | string, lang: string = 'ru'): string {
  const d = parseDate(date);
  return format(d, 'EEE', { locale: getLocale(lang) });
}

// Duration formatting
export function formatDurationMs(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${seconds}s`;
}

export function formatDurationMsFull(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    seconds.toString().padStart(2, '0'),
  ].join(':');
}

export function formatDurationHuman(ms: number, lang: string = 'ru'): string {
  const duration = intervalToDuration({ start: 0, end: ms });
  return formatDuration(duration, {
    locale: getLocale(lang),
    format: ['hours', 'minutes'],
    zero: false,
  });
}

// Date range utilities
export function getDateRange(
  period: 'today' | 'week' | 'month' | 'quarter',
  referenceDate: Date = new Date()
): { start: Date; end: Date } {
  switch (period) {
    case 'today':
      return {
        start: startOfDay(referenceDate),
        end: endOfDay(referenceDate),
      };
    case 'week':
      return {
        start: startOfWeek(referenceDate, { weekStartsOn: 1 }),
        end: endOfWeek(referenceDate, { weekStartsOn: 1 }),
      };
    case 'month':
      return {
        start: startOfMonth(referenceDate),
        end: endOfMonth(referenceDate),
      };
    case 'quarter':
      return {
        start: startOfQuarter(referenceDate),
        end: endOfQuarter(referenceDate),
      };
  }
}

// Re-export commonly used date-fns functions
export {
  parseISO,
  isValid,
  differenceInMilliseconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  addDays,
  subDays,
  isSameDay,
  isToday,
  isYesterday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  getDay,
  getHours,
  getMinutes,
  format,
};
