import type { PrayerDay, PrayerKey, SelectedLocation } from '../types';
import { readJson, writeJson } from './storage';
import { getTurkeyDateKey, getTurkeyMonth, getTurkeyYear } from '../utils/time';

const API = 'https://api.aladhan.com/v1';
const METHOD_DIYANET = 13;
const PRAYER_KEYS: PrayerKey[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function cleanTime(value: unknown): string {
  const match = String(value ?? '').match(/\b(\d{1,2}):(\d{2})\b/);
  return match ? `${match[1]!.padStart(2, '0')}:${match[2]}` : '--:--';
}

function parseDay(item: any): PrayerDay | null {
  const rawDate = String(item?.date?.gregorian?.date ?? '');
  const match = rawDate.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!match) return null;
  const date = `${match[3]}-${match[2]}-${match[1]}`;
  const timings = {} as Record<PrayerKey, string>;
  for (const key of PRAYER_KEYS) timings[key] = cleanTime(item?.timings?.[key]);
  const hijri = item?.date?.hijri
    ? `${item.date.hijri.day} ${item.date.hijri.month?.tr ?? item.date.hijri.month?.en ?? ''} ${item.date.hijri.year}`
    : undefined;
  return { date, hijri, timings };
}

function locationCacheKey(location: SelectedLocation, year: number, month: number): string {
  const identity = location.latitude && location.longitude
    ? `${location.latitude.toFixed(3)}_${location.longitude.toFixed(3)}`
    : location.address ?? location.label;
  return `@vakit/prayer/${encodeURIComponent(identity)}/${year}-${String(month).padStart(2, '0')}`;
}

export async function fetchPrayerMonth(
  location: SelectedLocation,
  year: number,
  month: number,
  force = false
): Promise<PrayerDay[]> {
  const cacheKey = locationCacheKey(location, year, month);
  if (!force) {
    const cached = await readJson<PrayerDay[]>(cacheKey, []);
    if (cached.length) return cached;
  }

  const query = `method=${METHOD_DIYANET}&school=1`;
  const hasCoords = Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
  const url = hasCoords
    ? `${API}/calendar/${year}/${month}?latitude=${location.latitude}&longitude=${location.longitude}&${query}`
    : `${API}/calendarByAddress/${year}/${month}?address=${encodeURIComponent(location.address ?? location.label)}&${query}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Namaz vakitleri alınamadı. İnternet bağlantınızı kontrol edin.');
  const json = await response.json();
  if (Number(json?.code) !== 200 || !Array.isArray(json?.data)) {
    throw new Error('Namaz vakti servisi geçerli veri döndürmedi.');
  }
  const days = json.data.map(parseDay).filter(Boolean) as PrayerDay[];
  if (!days.length) throw new Error('Bu konum için namaz vakti bulunamadı.');
  await writeJson(cacheKey, days);
  return days;
}

export async function fetchPrayerWindow(location: SelectedLocation, force = false): Promise<PrayerDay[]> {
  const now = new Date();
  const year = getTurkeyYear(now);
  const month = getTurkeyMonth(now);
  const next = month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
  const [current, following] = await Promise.all([
    fetchPrayerMonth(location, year, month, force),
    fetchPrayerMonth(location, next.year, next.month, force),
  ]);
  return [...current, ...following].sort((a, b) => a.date.localeCompare(b.date));
}

export function findPrayerDay(days: PrayerDay[], dateKey = getTurkeyDateKey()): PrayerDay | undefined {
  return days.find((day) => day.date === dateKey);
}

export const PRAYER_SOURCE_NOTE = 'AlAdhan • Diyanet hesaplama yöntemi (method 13, experimental)';
