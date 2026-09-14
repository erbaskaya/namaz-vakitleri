const { withAndroidManifest, withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withMinuteWidgetUpdates(config) {
  const appPackage = config.android && config.android.package;
  if (!appPackage) {
    throw new Error('android.package is required for minute widget updates');
  }

  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest;
    manifest['uses-permission'] = manifest['uses-permission'] || [];

    const ensurePermission = (name) => {
      const exists = manifest['uses-permission'].some(
        (item) => item.$ && item.$['android:name'] === name
      );
      if (!exists) {
        manifest['uses-permission'].push({ $: { 'android:name': name } });
      }
    };

    ensurePermission('android.permission.RECEIVE_BOOT_COMPLETED');
    ensurePermission('android.permission.SCHEDULE_EXACT_ALARM');

    const application = manifest.application && manifest.application[0];
    if (!application) return mod;
    application.receiver = application.receiver || [];

    const addReceiver = (receiver) => {
      const name = receiver.$['android:name'];
      const exists = application.receiver.some(
        (item) => item.$ && item.$['android:name'] === name
      );
      if (!exists) application.receiver.push(receiver);
    };

    // Receives our explicit one-minute AlarmManager broadcasts.
    addReceiver({
      $: {
        'android:name': '.widget.PrayerWidgetMinuteReceiver',
        'android:enabled': 'true',
        'android:exported': 'false',
      },
    });

    // Re-arms the minute timer after reboot or an APK update.
    addReceiver({
      $: {
        'android:name': '.widget.PrayerWidgetBootReceiver',
        'android:enabled': 'true',
        'android:exported': 'false',
      },
      'intent-filter': [
        {
          action: [
            { $: { 'android:name': 'android.intent.action.BOOT_COMPLETED' } },
            { $: { 'android:name': 'android.intent.action.MY_PACKAGE_REPLACED' } },
          ],
        },
      ],
    });

    return mod;
  });

  config = withDangerousMod(config, [
    'android',
    async (mod) => {
      const androidRoot = mod.modRequest.platformProjectRoot;
      const javaDir = path.join(
        androidRoot,
        'app',
        'src',
        'main',
        'java',
        ...appPackage.split('.'),
        'widget'
      );
      fs.mkdirSync(javaDir, { recursive: true });

      const minuteReceiverJava = `package ${appPackage}.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

public class PrayerWidgetMinuteReceiver extends BroadcastReceiver {
    private static final int REQUEST_CODE = 9217;

    @Override
    public void onReceive(Context context, Intent intent) {
        updateWidget(context);
        scheduleNextMinute(context);
    }

    public static void updateWidget(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, PrayerTimesWidget.class);
        int[] ids = manager.getAppWidgetIds(component);
        if (ids == null || ids.length == 0) {
            cancel(context);
            return;
        }

        Intent updateIntent = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        updateIntent.setComponent(component);
        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(updateIntent);
    }

    public static void scheduleNextMinute(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, PrayerTimesWidget.class);
        int[] ids = manager.getAppWidgetIds(component);
        if (ids == null || ids.length == 0) {
            cancel(context);
            return;
        }

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        long now = System.currentTimeMillis();
        long nextMinute = ((now / 60000L) + 1L) * 60000L + 300L;
        PendingIntent pendingIntent = pendingIntent(context);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
                } else {
                    alarmManager.set(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
            }
        } catch (SecurityException ignored) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC_WAKEUP, nextMinute, pendingIntent);
            }
        }
    }

    public static void cancel(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            alarmManager.cancel(pendingIntent(context));
        }
    }

    private static PendingIntent pendingIntent(Context context) {
        Intent intent = new Intent(context, PrayerWidgetMinuteReceiver.class);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags);
    }
}
`;

      const bootReceiverJava = `package ${appPackage}.widget;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class PrayerWidgetBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        PrayerWidgetMinuteReceiver.updateWidget(context);
        PrayerWidgetMinuteReceiver.scheduleNextMinute(context);
    }
}
`;

      // Important: do NOT overwrite PrayerTimesWidget.java. It is owned/generated
      // by react-native-android-widget. V7 failed because two plugins wrote this file.
      fs.writeFileSync(path.join(javaDir, 'PrayerWidgetMinuteReceiver.java'), minuteReceiverJava);
      fs.writeFileSync(path.join(javaDir, 'PrayerWidgetBootReceiver.java'), bootReceiverJava);
      return mod;
    },
  ]);

  return config;
};
