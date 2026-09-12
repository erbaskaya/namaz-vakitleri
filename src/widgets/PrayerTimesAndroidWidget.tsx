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
        borderRadius: 22,
        padding: 16,
        flexDirection: 'column',
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget text={data.location} style={{ fontSize: 14, fontWeight: '700', color: '#0F1F36' }} />
          <TextWidget text={data.dateLabel} style={{ fontSize: 10, color: '#6B7891', marginTop: 2 }} />
        </FlexWidget>
        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <TextWidget text={data.nextLabel} style={{ fontSize: 13, fontWeight: '700', color: '#0B5FFF' }} />
          <TextWidget text={data.nextTime} style={{ fontSize: 27, fontWeight: '700', color: '#0AA66E' }} />
        </FlexWidget>
      </FlexWidget>
      <TextWidget text={data.countdown} style={{ fontSize: 11, color: '#FF8A34', marginTop: 5 }} />
      <FlexWidget style={{ width: 'match_parent', flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 }}>
        <TextWidget text={`İmsak ${data.fajr}`} style={{ fontSize: 10, color: '#25324A' }} />
        <TextWidget text={`Öğle ${data.dhuhr}`} style={{ fontSize: 10, color: '#25324A' }} />
        <TextWidget text={`İkindi ${data.asr}`} style={{ fontSize: 10, color: '#25324A' }} />
        <TextWidget text={`Akşam ${data.maghrib}`} style={{ fontSize: 10, color: '#25324A' }} />
        <TextWidget text={`Yatsı ${data.isha}`} style={{ fontSize: 10, color: '#25324A' }} />
      </FlexWidget>
      <TextWidget text="by baskaya" style={{ fontSize: 9, color: '#6B7891', marginTop: 7 }} />
    </FlexWidget>
  );
}
