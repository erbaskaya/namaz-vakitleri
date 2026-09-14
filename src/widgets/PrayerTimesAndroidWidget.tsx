import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { PrayerWidgetPayload } from './widgetTypes';

export function PrayerTimesAndroidWidget({ data }: { data: PrayerWidgetPayload }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingHorizontal: 12,
        paddingVertical: 7,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={`${data.nextLabel}: ${data.nextTime}`}
        style={{
          fontSize: 12,
          fontWeight: '700',
          color: '#0B5FFF',
        }}
      />
      <TextWidget
        text={data.countdown}
        style={{
          fontSize: 21,
          fontWeight: '800',
          color: '#0F1F36',
          marginTop: 2,
        }}
      />
    </FlexWidget>
  );
}
