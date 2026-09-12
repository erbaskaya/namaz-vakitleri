export type PrayerKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type PrayerDay = {
  date: string;
  hijri?: string;
  timings: Record<PrayerKey, string>;
};

export type SelectedLocation = {
  mode: 'gps' | 'manual';
  label: string;
  province?: string;
  provinceId?: number;
  district?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
};

export type Province = {
  id: number;
  name: string;
  latitude?: number;
  longitude?: number;
};

export type District = {
  id: number;
  name: string;
  provinceId: number;
};

export type AlertConfig = {
  enabled: boolean;
  offsetMinutes: number;
  sound: boolean;
};

export type AlertSettings = Record<PrayerKey, AlertConfig>;

export type ReligiousDay = {
  id: string;
  date: string;
  title: string;
  category: 'kandil' | 'bayram' | 'other';
  dayLabel?: string;
};

export type NextPrayer = {
  key: PrayerKey;
  label: string;
  time: string;
  at: Date;
  dayDate: string;
};
