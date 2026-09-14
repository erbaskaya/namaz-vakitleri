const androidWidgetConfig = {
  widgets: [
    {
      name: 'PrayerTimesWidget',
      label: 'Namaz Vakti',
      minWidth: '110dp',
      minHeight: '55dp',
      targetCellWidth: 2,
      targetCellHeight: 1,
      description: 'Sıradaki namaz saatini ve kalan süreyi kompakt biçimde gösterir.',
      previewImage: './assets/widget-preview/prayer-times.png',
      updatePeriodMillis: 1800000
    }
  ]
};

module.exports = ({ config }) => ({
  ...config,
  name: 'Namaz Vakti ve Dini Günler',
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
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'POST_NOTIFICATIONS',
      'SCHEDULE_EXACT_ALARM',
      'RECEIVE_BOOT_COMPLETED'
    ]
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
            displayName: 'Namaz Vakti',
            description: 'Sıradaki namaz saatini ve kalan süreyi kompakt biçimde gösterir.',
            supportedFamilies: [
              'systemSmall',
              'accessoryRectangular'
            ]
          }
        ]
      }
    ],
    ['react-native-android-widget', androidWidgetConfig],
    './plugins/withMinuteWidgetUpdates'
  ]
});
