import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const androidWidgetConfig: WithAndroidWidgetsParams = {
  widgets: [
    {
      name: 'PrayerTimesWidget',
      label: 'Vakit • Namaz Vakitleri',
      minWidth: '250dp',
      minHeight: '110dp',
      targetCellWidth: 4,
      targetCellHeight: 2,
      description: 'Sıradaki namazı, kalan süreyi ve günlük vakitleri gösterir.',
      previewImage: './assets/widget-preview/prayer-times.png',
      updatePeriodMillis: 1800000
    }
  ]
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Vakit',
  slug: 'vakit-by-baskaya',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  scheme: 'vakit',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.baskaya.vakit',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Bulunduğunuz konuma ait namaz vakitlerini otomatik gösterebilmek için konum izni gerekir.'
    }
  },
  android: {
    package: 'com.baskaya.vakit',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0B5FFF'
    },
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION', 'POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM']
  },
  plugins: [
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Bulunduğunuz konuma ait namaz vakitlerini otomatik gösterebilmek için konum izni gerekir.'
      }
    ],
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#0B5FFF',
        defaultChannel: 'prayer-reminders'
      }
    ],
    [
      'expo-widgets',
      {
        groupIdentifier: 'group.com.baskaya.vakit',
        widgets: [
          {
            name: 'PrayerTimesWidget',
            displayName: 'Vakit',
            description: 'Sıradaki namazı, kalan süreyi ve günlük vakitleri gösterir.',
            supportedFamilies: ['systemSmall', 'systemMedium', 'systemLarge', 'accessoryRectangular']
          }
        ]
      }
    ],
    ['react-native-android-widget', androidWidgetConfig]
  ]
});
