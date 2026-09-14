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

    const hasBootPermission = manifest['uses-permission'].some(
      (item) => item.$ && item.$['android:name'] === 'android.permission.RECEIVE_BOOT_COMPLETED'
    );
    if (!hasBootPermission) {
      manifest['uses-permission'].push({ $: { 'android:name': 'android.permission.RECEIVE_BOOT_COMPLETED' } });
    }

    const application = manifest.application && manifest.application[0];
    if (!application) return mod;
    application.receiver = application.receiver || [];

    const receiverName = '.widget.PrayerWidgetBootReceiver';
    const exists = application.receiver.some(
      (receiver) => receiver.$ && receiver.$['android:name'] === receiverName
    );

    if (!exists) {
      application.receiver.push({
        $: {
          'android:name': receiverName,
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
    }

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

      const widgetJava = `package ${appPackage}.widget;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.reactnativeandroidwidget.RNWidgetProvider;

public class PrayerTimesWidget extends RNWidgetProvider {
    private static final String ACTION_MINUTE_UPDATE = "${appPackage}.WIDGET_MINUTE_UPDATE";
    private static final int REQUEST_CODE = 9217;

    @Override
    public void onEnabled(Context context) {
        super.onEnabled(context);
        scheduleNextMinute(context);
    }

    @Override
    public void onDisabled(Context context) {
        cancelMinuteUpdate(context);
        super.onDisabled(context);
    }

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        super.onUpdate(context, appWidgetManager, appWidgetIds);
        if (appWidgetIds != null && appWidgetIds.length > 0) {
            scheduleNextMinute(context);
        } else {
            cancelMinuteUpdate(context);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (ACTION_MINUTE_UPDATE.equals(action)) {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            ComponentName component = new ComponentName(context, PrayerTimesWidget.class);
            int[] ids = manager.getAppWidgetIds(component);
            if (ids != null && ids.length > 0) {
                onUpdate(context, manager, ids);
            } else {
                cancelMinuteUpdate(context);
            }
            return;
        }
        super.onReceive(context, intent);
    }

    public static void scheduleNextMinute(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        long now = System.currentTimeMillis();
        long nextMinute = ((now / 60000L) + 1L) * 60000L + 250L;
        PendingIntent pendingIntent = minutePendingIntent(context);

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                if (alarmManager.canScheduleExactAlarms()) {
                    alarmManager.setExact(AlarmManager.RTC, nextMinute, pendingIntent);
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(AlarmManager.RTC, nextMinute, pendingIntent);
                } else {
                    alarmManager.set(AlarmManager.RTC, nextMinute, pendingIntent);
                }
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC, nextMinute, pendingIntent);
            } else {
                alarmManager.setExact(AlarmManager.RTC, nextMinute, pendingIntent);
            }
        } catch (SecurityException ignored) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setAndAllowWhileIdle(AlarmManager.RTC, nextMinute, pendingIntent);
            } else {
                alarmManager.set(AlarmManager.RTC, nextMinute, pendingIntent);
            }
        }
    }

    public static void cancelMinuteUpdate(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager != null) {
            alarmManager.cancel(minutePendingIntent(context));
        }
    }

    private static PendingIntent minutePendingIntent(Context context) {
        Intent intent = new Intent(context, PrayerTimesWidget.class);
        intent.setAction(ACTION_MINUTE_UPDATE);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        return PendingIntent.getBroadcast(context, REQUEST_CODE, intent, flags);
    }
}
`;

      const bootReceiverJava = `package ${appPackage}.widget;

import android.appwidget.AppWidgetManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

public class PrayerWidgetBootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        ComponentName component = new ComponentName(context, PrayerTimesWidget.class);
        int[] ids = manager.getAppWidgetIds(component);
        if (ids == null || ids.length == 0) return;

        Intent updateIntent = new Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        updateIntent.setComponent(component);
        updateIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(updateIntent);
        PrayerTimesWidget.scheduleNextMinute(context);
    }
}
`;

      fs.writeFileSync(path.join(javaDir, 'PrayerTimesWidget.java'), widgetJava);
      fs.writeFileSync(path.join(javaDir, 'PrayerWidgetBootReceiver.java'), bootReceiverJava);
      return mod;
    },
  ]);

  return config;
};
