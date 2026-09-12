import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { AlertSettings, PrayerDay } from '../types';
import { PRAYER_KEYS, PRAYER_LABELS } from '../data/defaults';
import { daysForScheduling, turkeyDate } from '../utils/time';
import { readJson, writeJson } from './storage';

const IDS_KEY = '@vakit/notification-ids';
const CHANNEL_ID = 'prayer-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Namaz vakti hatırlatmaları',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 160, 250],
      lightColor: '#0B5FFF',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function cancelPreviousPrayerNotifications() {
  const ids = await readJson<string[]>(IDS_KEY, []);
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined)));
  await writeJson(IDS_KEY, []);
}

export async function schedulePrayerNotifications(days: PrayerDay[], settings: AlertSettings): Promise<number> {
  const granted = await ensureNotificationPermission();
  if (!granted) throw new Error('Bildirim izni verilmedi.');
  await cancelPreviousPrayerNotifications();

  const now = Date.now();
  const ids: string[] = [];
  for (const day of daysForScheduling(days, 8)) {
    for (const key of PRAYER_KEYS) {
      const config = settings[key];
      if (!config.enabled) continue;
      const prayerAt = turkeyDate(day.date, day.timings[key]);
      const notifyAt = new Date(prayerAt.getTime() - config.offsetMinutes * 60_000);
      if (notifyAt.getTime() <= now + 15_000) continue;
      const label = PRAYER_LABELS[key];
      const title = config.offsetMinutes === 0 ? `${label} vakti` : `${label} vaktine ${config.offsetMinutes} dakika`;
      const body = config.offsetMinutes === 0
        ? `${label} vakti geldi. Allah kabul etsin.`
        : `${label} vakti ${day.timings[key]}.`;
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: config.sound ? 'default' : undefined,
          data: { kind: 'prayer', prayerKey: key, prayerDate: day.date },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notifyAt,
          ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
        },
      });
      ids.push(id);
    }
  }
  await writeJson(IDS_KEY, ids);
  return ids.length;
}
