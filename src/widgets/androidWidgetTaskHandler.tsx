import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PrayerTimesAndroidWidget } from './PrayerTimesAndroidWidget';
import { EMPTY_WIDGET_PAYLOAD, type PrayerWidgetPayload } from './widgetTypes';
import { readJson } from '../services/storage';

const PAYLOAD_KEY = '@vakit/widget-payload';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  if (props.widgetInfo.widgetName !== 'PrayerTimesWidget') return;
  const data = await readJson<PrayerWidgetPayload>(PAYLOAD_KEY, EMPTY_WIDGET_PAYLOAD);
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
