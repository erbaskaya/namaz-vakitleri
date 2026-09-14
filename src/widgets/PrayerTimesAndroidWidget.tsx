import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { PrayerWidgetPayload } from './widgetTypes';

export function PrayerTimesAndroidWidget({ data }: { data: PrayerWidgetPayload }) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0B67F0',
        borderRadius: 22,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Sıradaki"
        style={{
          fontSize: 9,
          fontWeight: '600',
          color: '#D9E8FF',
        }}
      />
      <TextWidget
        text={data.nextLabel}
        style={{
          fontSize: 17,
          fontWeight: '800',
          color: '#FFFFFF',
          marginTop: 2,
        }}
      />
      <TextWidget
        text={data.nextTime}
        style={{
          fontSize: 31,
          fontWeight: '900',
          color: '#FFFFFF',
          marginTop: 0,
        }}
      />
      <TextWidget
        text="by baskaya"
        style={{
          fontSize: 7,
          fontWeight: '500',
          color: '#D9E8FF',
          marginTop: 3,
        }}
      />
    </FlexWidget>
  );
}
