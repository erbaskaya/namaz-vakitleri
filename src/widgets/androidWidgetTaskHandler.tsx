import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PrayerTimesAndroidWidget } from './PrayerTimesAndroidWidget';
import { EMPTY_WIDGET_PAYLOAD, type PrayerWidgetPayload } from './widgetTypes';
import { resolveWidgetPayload } from './widgetLogic';
import { readJson } from '../services/storage';

const PAYLOAD_KEY = '@vakit/widget-payload';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== 'PrayerTimesWidget') return;
  const stored = await readJson<PrayerWidgetPayload>(PAYLOAD_KEY, EMPTY_WIDGET_PAYLOAD);
  const data = resolveWidgetPayload(stored, new Date());

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
      props.renderWidget(<PrayerTimesAndroidWidget data={data} />);
      break;
    default:
      break;
  }
}
