import type { PrayerWidgetPayload, WidgetPrayerEvent } from './widgetTypes';

export function widgetTimeHHMM(time?: string): string {
  if (!time) return '--:--';
  const match = time.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return time;
  return `${match[1]!.padStart(2, '0')}:${match[2]}`;
}

export function widgetCountdownHHMM(target: Date, now = new Date()): string {
  const remainingMs = Math.max(0, target.getTime() - now.getTime());
  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeOldCountdown(value: string): string {
  const match = value.match(/(\d{1,3}):(\d{2})(?::\d{2})?/);
  if (!match) return value.replace(/\s*kaldı\s*/gi, '').trim() || '--:--';
  return `${match[1]!.padStart(2, '0')}:${match[2]}`;
}

export function resolveWidgetPayload(data: PrayerWidgetPayload, now = new Date()): PrayerWidgetPayload {
  const upcoming = (data.upcoming ?? [])
    .map((event) => ({ event, at: new Date(event.at) }))
    .filter(({ at }) => !Number.isNaN(at.getTime()))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  const next = upcoming.find(({ at }) => at.getTime() > now.getTime());
  if (next) {
    return {
      ...data,
      nextLabel: next.event.label,
      nextTime: widgetTimeHHMM(next.event.time),
      countdown: widgetCountdownHHMM(next.at, now),
    };
  }

  // Eski widget verisi güncelleme sonrası cihazda kalmışsa saniyeyi yine göstermeyelim.
  return {
    ...data,
    nextTime: widgetTimeHHMM(data.nextTime),
    countdown: normalizeOldCountdown(data.countdown),
  };
}

export function makeWidgetEvent(label: string, time: string, at: Date): WidgetPrayerEvent {
  return {
    label,
    time: widgetTimeHHMM(time),
    at: at.toISOString(),
  };
}
