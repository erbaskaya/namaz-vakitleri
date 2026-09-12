import { HStack, Spacer, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';
import type { PrayerWidgetPayload } from './widgetTypes';

const PrayerTimesWidget = (props: PrayerWidgetPayload, environment: WidgetEnvironment) => {
  'widget';
  const blue = '#0B5FFF';
  const green = '#0AA66E';
  const orange = '#FF8A34';
  const navy = environment.colorScheme === 'dark' ? '#FFFFFF' : '#0F1F36';
  const muted = environment.colorScheme === 'dark' ? '#D0D7E3' : '#6B7891';

  if (environment.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack>
        <Text modifiers={[font({ weight: 'bold', size: 12 })]}>{props.location}</Text>
        <HStack>
          <Text modifiers={[font({ weight: 'bold', size: 16 })]}>{props.nextLabel}</Text>
          <Spacer />
          <Text modifiers={[font({ weight: 'bold', size: 16 })]}>{props.nextTime}</Text>
        </HStack>
      </VStack>
    );
  }

  if (environment.widgetFamily === 'systemSmall') {
    return (
      <VStack spacing={6} modifiers={[padding({ all: 10 })]}>
        <Text modifiers={[font({ weight: 'semibold', size: 12 }), foregroundStyle(muted)]}>{props.location}</Text>
        <Text modifiers={[font({ weight: 'bold', size: 17 }), foregroundStyle(blue)]}>{props.nextLabel}</Text>
        <Text modifiers={[font({ weight: 'bold', size: 34 }), foregroundStyle(navy)]}>{props.nextTime}</Text>
        <Text modifiers={[font({ size: 12 }), foregroundStyle(green)]}>{props.countdown}</Text>
        <Text modifiers={[font({ size: 10 }), foregroundStyle(orange)]}>by baskaya</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={7} modifiers={[padding({ all: 12 })]}>
      <HStack>
        <VStack>
          <Text modifiers={[font({ weight: 'bold', size: 14 }), foregroundStyle(navy)]}>{props.location}</Text>
          <Text modifiers={[font({ size: 11 }), foregroundStyle(muted)]}>{props.dateLabel}</Text>
        </VStack>
        <Spacer />
        <VStack>
          <Text modifiers={[font({ weight: 'bold', size: 15 }), foregroundStyle(blue)]}>{props.nextLabel}</Text>
          <Text modifiers={[font({ weight: 'bold', size: 24 }), foregroundStyle(green)]}>{props.nextTime}</Text>
        </VStack>
      </HStack>
      <HStack>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(navy)]}>İmsak {props.fajr}</Text><Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(navy)]}>Öğle {props.dhuhr}</Text><Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(navy)]}>İkindi {props.asr}</Text>
      </HStack>
      <HStack>
        <Text modifiers={[font({ size: 11 }), foregroundStyle(navy)]}>Akşam {props.maghrib}</Text><Spacer />
        <Text modifiers={[font({ size: 11 }), foregroundStyle(navy)]}>Yatsı {props.isha}</Text><Spacer />
        <Text modifiers={[font({ size: 10 }), foregroundStyle(orange)]}>by baskaya</Text>
      </HStack>
    </VStack>
  );
};

export default createWidget<PrayerWidgetPayload>('PrayerTimesWidget', PrayerTimesWidget);
