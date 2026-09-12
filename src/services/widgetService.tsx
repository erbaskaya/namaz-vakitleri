import React from 'react';
import { Platform } from 'react-native';
import type { NextPrayer, PrayerDay, SelectedLocation } from '../types';
import { findPrayerDay } from './prayerService';
import { formatCountdown, formatLongDate, getNextPrayer, getTurkeyDateKey } from '../utils/time';
import { writeJson } from './storage';
import { PrayerTimesAndroidWidget } from '../widgets/PrayerTimesAndroidWidget';
import type { PrayerWidgetPayload } from '../widgets/widgetTypes';

const PAYLOAD_KEY = '@vakit/widget-payload';

function withSeconds(time?: string) {
  if (!time) return '--:--:--';
  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (!match) return time;
  const hh = match[1].padStart(2, '0');
  const mm = match[2];
  const ss = match[3] ?? '00';
  return `${hh}:${mm}:${ss}`;
}

function buildPayload(location: SelectedLocation, day: PrayerDay | undefined, next: NextPrayer | null, now = new Date()): PrayerWidgetPayload {
  return {
    location: location.label,
    nextLabel: next?.label ?? 'Sıradaki vakit',
    nextTime: withSeconds(next?.time),
    countdown: next ? `${formatCountdown(next.at.getTime() - now.getTime())} kaldı` : 'Vakit verisi bekleniyor',
    dateLabel: formatLongDate(now),
    fajr: day?.timings.Fajr ?? '--:--',
    sunrise: day?.timings.Sunrise ?? '--:--',
    dhuhr: day?.timings.Dhuhr ?? '--:--',
    asr: day?.timings.Asr ?? '--:--',
    maghrib: day?.timings.Maghrib ?? '--:--',
    isha: day?.timings.Isha ?? '--:--',
  };
}

export async function refreshWidgets(location: SelectedLocation, days: PrayerDay[]) {
  const now = new Date();
  const day = findPrayerDay(days, getTurkeyDateKey(now));
  const next = getNextPrayer(days, now);
  const payload = buildPayload(location, day, next, now);
  await writeJson(PAYLOAD_KEY, payload);

  if (Platform.OS === 'android') {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    await requestWidgetUpdate({
      widgetName: 'PrayerTimesWidget',
      renderWidget: () => <PrayerTimesAndroidWidget data={payload} />,
    });
  }

  if (Platform.OS === 'ios') {
    const PrayerTimesWidget = require('../widgets/PrayerTimesWidget.ios').default;
    const timeline: Array<{ date: Date; props: PrayerWidgetPayload }> = [{ date: now, props: payload }];
    const future = days
      .filter((d) => d.date >= getTurkeyDateKey(now))
      .slice(0, 3);
    for (const d of future) {
      for (const key of ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const) {
        const eventDate = new Date(`${d.date}T${d.timings[key]}:00+03:00`);
        if (eventDate <= now) continue;
        const nextAtEvent = getNextPrayer(days, new Date(eventDate.getTime() + 1000));
        const dayAtEvent = findPrayerDay(days, d.date);
        timeline.push({
          date: eventDate,
          props: buildPayload(location, dayAtEvent, nextAtEvent, eventDate),
        });
      }
    }
    PrayerTimesWidget.updateTimeline(timeline);
  }
}
