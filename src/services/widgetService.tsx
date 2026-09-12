import React from 'react';
import { Platform } from 'react-native';
import type { PrayerDay, SelectedLocation } from '../types';
import { PRAYER_KEYS, PRAYER_LABELS } from '../data/defaults';
import { findPrayerDay } from './prayerService';
import { formatLongDate, getTurkeyDateKey, turkeyDate } from '../utils/time';
import { writeJson } from './storage';
import { PrayerTimesAndroidWidget } from '../widgets/PrayerTimesAndroidWidget';
import type { PrayerWidgetPayload, WidgetPrayerEvent } from '../widgets/widgetTypes';
import { makeWidgetEvent, resolveWidgetPayload } from '../widgets/widgetLogic';

const PAYLOAD_KEY = '@vakit/widget-payload';

function buildUpcoming(days: PrayerDay[], now = new Date()): WidgetPrayerEvent[] {
  const events: WidgetPrayerEvent[] = [];
  const ordered = [...days].sort((a, b) => a.date.localeCompare(b.date));

  for (const day of ordered) {
    for (const key of PRAYER_KEYS) {
      const at = turkeyDate(day.date, day.timings[key]);
      if (at.getTime() <= now.getTime()) continue;
      events.push(makeWidgetEvent(PRAYER_LABELS[key], day.timings[key], at));
      if (events.length >= 36) return events;
    }
  }

  return events;
}

function buildPayload(location: SelectedLocation, days: PrayerDay[], now = new Date()): PrayerWidgetPayload {
  const day = findPrayerDay(days, getTurkeyDateKey(now));
  const upcoming = buildUpcoming(days, now);
  const first = upcoming[0];

  return resolveWidgetPayload({
    location: location.label,
    nextLabel: first?.label ?? 'Sıradaki vakit',
    nextTime: first?.time ?? '--:--',
    countdown: '--:--',
    dateLabel: formatLongDate(now),
    fajr: day?.timings.Fajr ?? '--:--',
    sunrise: day?.timings.Sunrise ?? '--:--',
    dhuhr: day?.timings.Dhuhr ?? '--:--',
    asr: day?.timings.Asr ?? '--:--',
    maghrib: day?.timings.Maghrib ?? '--:--',
    isha: day?.timings.Isha ?? '--:--',
    upcoming,
  }, now);
}

export async function refreshWidgets(location: SelectedLocation, days: PrayerDay[]) {
  const now = new Date();
  const payload = buildPayload(location, days, now);
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

    // iOS WidgetKit zaman çizelgesiyle kalan süreyi yaklaşık 30 dakikada bir yeniler.
    for (let step = 1; step <= 96; step++) {
      const timelineDate = new Date(now.getTime() + step * 30 * 60 * 1000);
      timeline.push({
        date: timelineDate,
        props: resolveWidgetPayload(payload, timelineDate),
      });
    }

    PrayerTimesWidget.updateTimeline(timeline);
  }
}
