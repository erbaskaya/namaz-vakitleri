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
};

export const EMPTY_WIDGET_PAYLOAD: PrayerWidgetPayload = {
  location: 'Konum seçin',
  nextLabel: 'Sıradaki vakit',
  nextTime: '--:--',
  countdown: 'Uygulamayı açın',
  dateLabel: 'Vakit',
  fajr: '--:--',
  sunrise: '--:--',
  dhuhr: '--:--',
  asr: '--:--',
  maghrib: '--:--',
  isha: '--:--',
};
