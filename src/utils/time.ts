import type { NextPrayer, PrayerDay, PrayerKey } from '../types';
import { PRAYER_KEYS, PRAYER_LABELS } from '../data/defaults';

const TURKEY_TZ = 'Europe/Istanbul';

export function getTurkeyDateKey(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TURKEY_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

export function getTurkeyYear(date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: TURKEY_TZ, year: 'numeric' }).format(date));
}

export function getTurkeyMonth(date = new Date()): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: TURKEY_TZ, month: '2-digit' }).format(date));
}

export function turkeyDate(dateKey: string, hhmm: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  const [hour, minute] = hhmm.split(':').map(Number);
  // Türkiye 2016'dan beri yıl boyunca UTC+3 kullanıyor.
  return new Date(Date.UTC(year!, month! - 1, day!, hour! - 3, minute!, 0));
}

export function formatLongDate(date = new Date()): string {
  return new Intl.DateTimeFormat('tr-TR', {
    timeZone: TURKEY_TZ,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year!, month! - 1, day!, 12))
  );
}

export function formatCountdown(ms: number): string {
  const safe = Math.max(0, ms);
  const totalSeconds = Math.floor(safe / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function getNextPrayer(days: PrayerDay[], now = new Date()): NextPrayer | null {
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of ordered) {
    for (const key of PRAYER_KEYS) {
      const at = turkeyDate(day.date, day.timings[key]);
      if (at.getTime() > now.getTime()) {
        return {
          key,
          label: PRAYER_LABELS[key],
          time: day.timings[key],
          at,
          dayDate: day.date,
        };
      }
    }
  }
  return null;
}

export function dateKeyToDisplay(dateKey: string): string {
  return formatShortDate(dateKey);
}

export function addDaysTurkey(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day! + days, 12));
  return getTurkeyDateKey(date);
}

export function daysForScheduling(days: PrayerDay[], count = 8): PrayerDay[] {
  const today = getTurkeyDateKey();
  return days.filter((day) => day.date >= today).slice(0, count);
}

export function prayerTimeFor(day: PrayerDay | undefined, key: PrayerKey): string {
  return day?.timings[key] ?? '--:--';
}
