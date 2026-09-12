import type { AlertSettings, PrayerKey } from '../types';

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  Fajr: 'İmsak',
  Sunrise: 'Güneş',
  Dhuhr: 'Öğle',
  Asr: 'İkindi',
  Maghrib: 'Akşam',
  Isha: 'Yatsı',
};

export const PRAYER_KEYS: PrayerKey[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const DEFAULT_ALERTS: AlertSettings = {
  Fajr: { enabled: true, offsetMinutes: 10, sound: true },
  Sunrise: { enabled: false, offsetMinutes: 0, sound: false },
  Dhuhr: { enabled: true, offsetMinutes: 10, sound: true },
  Asr: { enabled: true, offsetMinutes: 10, sound: true },
  Maghrib: { enabled: true, offsetMinutes: 10, sound: true },
  Isha: { enabled: true, offsetMinutes: 10, sound: true },
};

export const DEFAULT_LOCATION = {
  mode: 'manual' as const,
  label: 'Ankara Merkez',
  province: 'Ankara',
  provinceId: 6,
  address: 'Ankara, Türkiye',
};
