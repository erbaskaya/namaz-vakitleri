export type WidgetPrayerEvent = {
  label: string;
  time: string;
  at: string;
};

export type PrayerWidgetPayload = {
  location: string;
  nextLabel: string;
  nextTime: string;
  countdown: string;
  dateLabel: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  upcoming?: WidgetPrayerEvent[];
};

export const EMPTY_WIDGET_PAYLOAD: PrayerWidgetPayload = {
  location: 'Konum seçin',
  nextLabel: 'Sıradaki vakit',
  nextTime: '--:--',
  countdown: '--:--',
  dateLabel: 'Namaz Vakti',
  fajr: '--:--',
  sunrise: '--:--',
  dhuhr: '--:--',
  asr: '--:--',
  maghrib: '--:--',
  isha: '--:--',
  upcoming: [],
};
