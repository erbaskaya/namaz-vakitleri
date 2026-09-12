import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { PrayerWidgetPayload } from './widgetTypes';

const PrayerTimesWidget = (props: PrayerWidgetPayload, environment: WidgetEnvironment) => {
  'widget';
  const blue = '#0B5FFF';
  const navy = environment.colorScheme === 'dark' ? '#FFFFFF' : '#0F1F36';

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack spacing={1}>
        <Text modifiers={[font({ weight: 'semibold', size: 11 })]}>
          {props.nextLabel}: {props.nextTime}
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 16 })]}>
          Kalan: {props.countdown}
        </Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={5} modifiers={[padding({ all: 11 })]}>
      <Text modifiers={[font({ weight: 'bold', size: 14 }), foregroundStyle(blue)]}>
        {props.nextLabel}: {props.nextTime}
      </Text>
      <Text modifiers={[font({ weight: 'bold', size: 25 }), foregroundStyle(navy)]}>
        Kalan: {props.countdown}
      </Text>
    </VStack>
  );
};

export default createWidget<PrayerWidgetPayload>('PrayerTimesWidget', PrayerTimesWidget);
