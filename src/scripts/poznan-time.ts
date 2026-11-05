export const POZNAN_TIME_ZONE = 'Europe/Warsaw';

export type DayPhase = 'morning' | 'daytime' | 'afternoon' | 'evening' | 'night';

export interface PoznanTime {
  hour: number;
  minute: number;
  month: number;
  day: number;
  /** English short weekday ("Mon" … "Sun"), independent of page language. */
  weekday: string;
}

export function getPoznanTime(now: Date): PoznanTime {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: POZNAN_TIME_ZONE,
    weekday: 'short',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? '';

  return {
    hour: Number(read('hour')),
    minute: Number(read('minute')),
    month: Number(read('month')),
    day: Number(read('day')),
    weekday: read('weekday'),
  };
}

export function getDayPhase(hour: number): DayPhase {
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 13) return 'daytime';
  if (hour >= 13 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function localeFor(lang: string | undefined): string {
  return lang === 'pl' ? 'pl-PL' : 'en-GB';
}
