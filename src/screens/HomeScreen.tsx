import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Brand } from '../components/Brand';
import { colors, radius } from '../theme';
import type { NextPrayer, PrayerDay, ReligiousDay, SelectedLocation } from '../types';
import { PRAYER_KEYS, PRAYER_LABELS } from '../data/defaults';
import { formatCountdown, formatLongDate, formatShortDate } from '../utils/time';

const accents = [colors.blue, colors.orange, colors.green, colors.blue, colors.orange, colors.green];

export function HomeScreen({
  location,
  today,
  nextPrayer,
  now,
  religiousDays,
  loading,
  refreshing,
  error,
  onOpenLocation,
  onRefresh,
  onOpenDays,
}: {
  location: SelectedLocation;
  today?: PrayerDay;
  nextPrayer: NextPrayer | null;
  now: Date;
  religiousDays: ReligiousDay[];
  loading: boolean;
  refreshing: boolean;
  error?: string;
  onOpenLocation: () => void;
  onRefresh: () => void;
  onOpenDays: () => void;
}) {
  const upcomingDay = religiousDays.find((day) => new Date(`${day.date}T00:00:00+03:00`).getTime() >= now.getTime());

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Brand />
        <TouchableOpacity style={styles.locationButton} onPress={onOpenLocation} activeOpacity={0.8}>
          <Text style={styles.locationPin}>⌖</Text>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.locationLabel}>KONUM</Text>
            <Text style={styles.locationText} numberOfLines={1}>{location.label}</Text>
          </View>
          <Text style={styles.locationArrow}>⌄</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.date}>{formatLongDate(now)}</Text>

      <View style={styles.hero}>
        <View style={styles.heroGreen} />
        <View style={styles.heroOrange} />
        <Text style={styles.heroEyebrow}>SIRADAKİ VAKİT</Text>
        {loading && !nextPrayer ? (
          <View style={styles.heroLoading}><ActivityIndicator color="white" /><Text style={styles.heroLoadingText}>Vakitler hesaplanıyor…</Text></View>
        ) : nextPrayer ? (
          <>
            <View style={styles.heroMainRow}>
              <View>
                <Text style={styles.heroPrayer}>{nextPrayer.label}</Text>
                <Text style={styles.heroTime}>{nextPrayer.time}</Text>
              </View>
              <View style={styles.countdownCard}>
                <Text style={styles.countdownLabel}>KALAN SÜRE</Text>
                <Text style={styles.countdown}>{formatCountdown(nextPrayer.at.getTime() - now.getTime())}</Text>
              </View>
            </View>
            <View style={styles.heroDivider} />
            <Text style={styles.heroFoot}>Namaz vaktine göre bildirim ve sesli hatırlatma ayarlayabilirsiniz.</Text>
          </>
        ) : (
          <Text style={styles.heroEmpty}>Vakit bilgisi yüklenemedi.</Text>
        )}
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorTitle}>Bağlantı bilgisi</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh}><Text style={styles.retry}>Yeniden dene</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.sectionTitleRow}>
        <View>
          <Text style={styles.sectionEyebrow}>BUGÜN</Text>
          <Text style={styles.sectionTitle}>Namaz Vakitleri</Text>
        </View>
        {today?.hijri ? <Text style={styles.hijri}>{today.hijri}</Text> : null}
      </View>

      <View style={styles.grid}>
        {PRAYER_KEYS.map((key, index) => {
          const active = nextPrayer?.key === key && nextPrayer.dayDate === today?.date;
          return (
            <View key={key} style={[styles.prayerCard, active && styles.prayerCardActive]}>
              <View style={[styles.accentDot, { backgroundColor: accents[index] }]} />
              <Text style={[styles.prayerLabel, active && styles.prayerLabelActive]}>{PRAYER_LABELS[key]}</Text>
              <Text style={[styles.prayerTime, active && styles.prayerTimeActive]}>{today?.timings[key] ?? '--:--'}</Text>
              {active && <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>Sıradaki</Text></View>}
            </View>
          );
        })}
      </View>

      <TouchableOpacity style={styles.religiousCard} onPress={onOpenDays} activeOpacity={0.8}>
        <View style={styles.religiousIcon}><Text style={styles.religiousIconText}>☾</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.religiousEyebrow}>YAKLAŞAN DİNİ GÜN</Text>
          <Text style={styles.religiousTitle}>{upcomingDay?.title ?? 'Dini gün takvimini görüntüle'}</Text>
          {upcomingDay && <Text style={styles.religiousDate}>{formatShortDate(upcomingDay.date)}</Text>}
        </View>
        <Text style={styles.cardArrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.sourceInfo}>
        <Text style={styles.sourceText}>Vakit hesaplama: Diyanet yöntemi (AlAdhan) • Konum: {location.mode === 'gps' ? 'GPS' : 'İl/ilçe seçimi'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 28 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  locationButton: { maxWidth: '54%', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 10, borderRadius: 16 },
  locationPin: { color: colors.blue, fontSize: 18, fontWeight: '800' },
  locationLabel: { fontSize: 8, fontWeight: '800', color: colors.muted, letterSpacing: 1 },
  locationText: { fontSize: 11, fontWeight: '800', color: colors.navy, marginTop: 1 },
  locationArrow: { color: colors.muted, fontSize: 17 },
  date: { color: colors.muted, fontSize: 12, marginTop: 18, marginBottom: 10, textTransform: 'capitalize' },
  hero: { minHeight: 220, backgroundColor: colors.blue, borderRadius: radius.xl, padding: 22, overflow: 'hidden' },
  heroGreen: { position: 'absolute', width: 170, height: 170, borderRadius: 85, backgroundColor: colors.green, right: -62, top: -72, opacity: 0.85 },
  heroOrange: { position: 'absolute', width: 78, height: 78, borderRadius: 39, backgroundColor: colors.orange, right: 24, bottom: -39, opacity: 0.95 },
  heroEyebrow: { color: '#BDD2FF', fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  heroMainRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16, gap: 14 },
  heroPrayer: { fontSize: 24, fontWeight: '800', color: 'white' },
  heroTime: { fontSize: 48, fontWeight: '900', letterSpacing: -1.5, color: 'white', marginTop: -2 },
  countdownCard: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.23)', borderRadius: 18, paddingVertical: 10, paddingHorizontal: 12, minWidth: 128 },
  countdownLabel: { color: '#D9E5FF', fontSize: 8, fontWeight: '800', letterSpacing: 1 },
  countdown: { color: 'white', fontSize: 19, fontWeight: '800', marginTop: 3 },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 22, marginBottom: 12 },
  heroFoot: { color: '#E3EBFF', fontSize: 11, lineHeight: 16, maxWidth: '82%' },
  heroLoading: { height: 145, alignItems: 'center', justifyContent: 'center', gap: 10 },
  heroLoadingText: { color: 'white', fontSize: 12 },
  heroEmpty: { color: 'white', fontWeight: '700', marginTop: 24 },
  errorBox: { marginTop: 12, borderRadius: radius.md, padding: 14, backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: '#F4DADA' },
  errorTitle: { color: colors.danger, fontWeight: '800', fontSize: 12 },
  errorText: { color: colors.text, fontSize: 11, lineHeight: 16, marginTop: 4 },
  retry: { color: colors.blue, fontWeight: '800', fontSize: 11, marginTop: 7 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, marginBottom: 12 },
  sectionEyebrow: { color: colors.green, fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  sectionTitle: { color: colors.navy, fontSize: 21, fontWeight: '800', marginTop: 2 },
  hijri: { color: colors.muted, fontSize: 10, maxWidth: 130, textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  prayerCard: { width: '31.5%', minHeight: 112, backgroundColor: colors.surface, borderRadius: radius.md, padding: 11, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  prayerCardActive: { backgroundColor: colors.blueSoft, borderColor: '#B8CEFF' },
  accentDot: { width: 9, height: 9, borderRadius: 5, marginBottom: 10 },
  prayerLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  prayerLabelActive: { color: colors.blue },
  prayerTime: { color: colors.navy, fontSize: 20, fontWeight: '800', marginTop: 4, letterSpacing: -0.5 },
  prayerTimeActive: { color: colors.blue },
  nextBadge: { alignSelf: 'flex-start', backgroundColor: colors.blue, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, marginTop: 6 },
  nextBadgeText: { color: 'white', fontSize: 7, fontWeight: '800' },
  religiousCard: { marginTop: 18, minHeight: 92, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  religiousIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.orangeSoft, alignItems: 'center', justifyContent: 'center' },
  religiousIconText: { fontSize: 28, color: colors.orange },
  religiousEyebrow: { color: colors.orange, fontSize: 8, fontWeight: '800', letterSpacing: 1.1 },
  religiousTitle: { color: colors.navy, fontSize: 14, fontWeight: '800', marginTop: 3 },
  religiousDate: { color: colors.muted, fontSize: 11, marginTop: 3 },
  cardArrow: { color: colors.muted, fontSize: 28 },
  sourceInfo: { paddingTop: 16, alignItems: 'center' },
  sourceText: { color: '#9AA5B9', fontSize: 9, textAlign: 'center' },
});
