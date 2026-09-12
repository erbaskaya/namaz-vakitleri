import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import type { AlertSettings, PrayerDay, ReligiousDay, SelectedLocation } from './src/types';
import { BottomNav, type TabKey } from './src/components/BottomNav';
import { LocationPicker } from './src/components/LocationPicker';
import { HomeScreen } from './src/screens/HomeScreen';
import { ReligiousDaysScreen } from './src/screens/ReligiousDaysScreen';
import { AlertsScreen } from './src/screens/AlertsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { colors } from './src/theme';
import { DEFAULT_ALERTS, DEFAULT_LOCATION } from './src/data/defaults';
import { detectCurrentLocation } from './src/services/locationService';
import { fetchPrayerWindow, findPrayerDay } from './src/services/prayerService';
import { getReligiousDays } from './src/services/religiousDaysService';
import { schedulePrayerNotifications } from './src/services/notificationService';
import { readJson, writeJson } from './src/services/storage';
import { refreshWidgets } from './src/services/widgetService';
import { getNextPrayer, getTurkeyDateKey, getTurkeyYear } from './src/utils/time';

const LOCATION_KEY = '@vakit/selected-location';
const ALERTS_KEY = '@vakit/alert-settings';

function AppContent() {
  const [tab, setTab] = useState<TabKey>('home');
  const [location, setLocation] = useState<SelectedLocation>(DEFAULT_LOCATION);
  const [prayerDays, setPrayerDays] = useState<PrayerDay[]>([]);
  const [religiousDays, setReligiousDays] = useState<ReligiousDay[]>([]);
  const [alerts, setAlerts] = useState<AlertSettings>(DEFAULT_ALERTS);
  const [now, setNow] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [religiousLoading, setReligiousLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [scheduledCount, setScheduledCount] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const year = getTurkeyYear(now);

  const loadPrayers = useCallback(async (target: SelectedLocation, force = false) => {
    try {
      setError(undefined);
      const days = await fetchPrayerWindow(target, force);
      setPrayerDays(days);
      refreshWidgets(target, days).catch(() => undefined);
      return days;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Namaz vakitleri yüklenemedi.';
      setError(message);
      return [] as PrayerDay[];
    }
  }, []);

  const applyLocation = useCallback(async (next: SelectedLocation) => {
    setLocation(next);
    setPickerOpen(false);
    await writeJson(LOCATION_KEY, next);
    setLoading(true);
    await loadPrayers(next);
    setLoading(false);
  }, [loadPrayers]);

  const detectAndApplyLocation = useCallback(async () => {
    setLocating(true);
    try {
      const detected = await detectCurrentLocation();
      await applyLocation(detected);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Konum alınamadı.';
      Alert.alert('Konum alınamadı', message);
      throw e;
    } finally {
      setLocating(false);
    }
  }, [applyLocation]);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      const [storedLocation, storedAlerts] = await Promise.all([
        readJson<SelectedLocation | null>(LOCATION_KEY, null),
        readJson<AlertSettings>(ALERTS_KEY, DEFAULT_ALERTS),
      ]);
      if (!mounted) return;
      setAlerts(storedAlerts);

      let firstLocation = storedLocation;
      if (!firstLocation) {
        try {
          firstLocation = await detectCurrentLocation();
          await writeJson(LOCATION_KEY, firstLocation);
        } catch {
          firstLocation = DEFAULT_LOCATION;
        }
      }
      if (!mounted) return;
      setLocation(firstLocation);
      await loadPrayers(firstLocation);
      if (mounted) setLoading(false);
    };
    initialize();
    return () => { mounted = false; };
  }, [loadPrayers]);

  useEffect(() => {
    let mounted = true;
    setReligiousLoading(true);
    getReligiousDays(year)
      .then((days) => { if (mounted) setReligiousDays(days); })
      .finally(() => { if (mounted) setReligiousLoading(false); });
    return () => { mounted = false; };
  }, [year]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const today = useMemo(() => findPrayerDay(prayerDays, getTurkeyDateKey(now)), [prayerDays, now]);
  const nextPrayer = useMemo(() => getNextPrayer(prayerDays, now), [prayerDays, now]);

  const refresh = async () => {
    setRefreshing(true);
    await loadPrayers(location, true);
    getReligiousDays(year).then(setReligiousDays).catch(() => undefined);
    setRefreshing(false);
  };

  const saveAlerts = async () => {
    setSavingAlerts(true);
    try {
      await writeJson(ALERTS_KEY, alerts);
      if (!prayerDays.length) {
        const days = await loadPrayers(location);
        if (!days.length) throw new Error('Vakit bilgisi olmadan bildirimler planlanamadı.');
        const count = await schedulePrayerNotifications(days, alerts);
        setScheduledCount(count);
      } else {
        const count = await schedulePrayerNotifications(prayerDays, alerts);
        setScheduledCount(count);
      }
      Alert.alert('Bildirimler hazır', 'Seçtiğiniz namaz vakitleri için yaklaşan bildirimler telefonda planlandı.');
    } catch (e) {
      Alert.alert('Bildirim ayarlanamadı', e instanceof Error ? e.message : 'Sistem bildirim iznini kontrol edin.');
    } finally {
      setSavingAlerts(false);
    }
  };

  const openDays = () => setTab('days');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" backgroundColor={colors.background} />

      <View style={styles.app}>
        <View style={styles.body}>
          {tab === 'home' && (
            <HomeScreen
              location={location}
              today={today}
              nextPrayer={nextPrayer}
              now={now}
              religiousDays={religiousDays}
              loading={loading}
              refreshing={refreshing}
              error={error}
              onOpenLocation={() => setPickerOpen(true)}
              onRefresh={refresh}
              onOpenDays={openDays}
            />
          )}
          {tab === 'days' && (
            <ReligiousDaysScreen
              days={religiousDays}
              year={year}
              loading={religiousLoading}
            />
          )}
          {tab === 'alerts' && (
            <AlertsScreen
              settings={alerts}
              onChange={setAlerts}
              onSave={saveAlerts}
              saving={savingAlerts}
              scheduledCount={scheduledCount}
            />
          )}
          {tab === 'settings' && (
            <SettingsScreen
              location={location}
              locating={locating}
              onDetectLocation={detectAndApplyLocation}
              onOpenLocation={() => setPickerOpen(true)}
            />
          )}
        </View>

        <SafeAreaView
          style={styles.bottomSafeArea}
          edges={['bottom', 'left', 'right']}
        >
          <BottomNav active={tab} onChange={setTab} />
        </SafeAreaView>
      </View>

      <LocationPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={applyLocation}
        onAutoDetect={detectAndApplyLocation}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
  },
  bottomSafeArea: {
    backgroundColor: colors.surface,
  },
});
