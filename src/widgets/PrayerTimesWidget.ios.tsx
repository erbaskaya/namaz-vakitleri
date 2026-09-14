import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding, background, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { PrayerWidgetPayload } from './widgetTypes';

const PrayerTimesWidget = (props: PrayerWidgetPayload, environment: WidgetEnvironment) => {
  'widget';
  const white = '#FFFFFF';
  const soft = '#D9E8FF';
  const blue = '#0B67F0';

  return (
    <VStack
      spacing={1}
      modifiers={[
        padding({ all: 12 }),
        background(blue),
        cornerRadius(20),
      ]}
    >
      <Text modifiers={[font({ weight: 'semibold', size: 9 }), foregroundStyle(soft)]}>
        Sıradaki
      </Text>
      <Text modifiers={[font({ weight: 'bold', size: 17 }), foregroundStyle(white)]}>
        {props.nextLabel}
      </Text>
      <Text modifiers={[font({ weight: 'bold', size: 30 }), foregroundStyle(white)]}>
        {props.nextTime}
      </Text>
      <Text modifiers={[font({ weight: 'regular', size: 7 }), foregroundStyle(soft)]}>
        by baskaya
      </Text>
    </VStack>
  );
};

export default createWidget<PrayerWidgetPayload>('PrayerTimesWidget', PrayerTimesWidget);
