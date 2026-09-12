import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SelectedLocation } from '../types';
import { colors, radius } from '../theme';
import { PRAYER_SOURCE_NOTE } from '../services/prayerService';

export function SettingsScreen({
  location,
  locating,
  onDetectLocation,
  onOpenLocation,
}: {
  location: SelectedLocation;
  locating: boolean;
  onDetectLocation: () => Promise<void>;
  onOpenLocation: () => void;
}) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.brandCard}>
        <Image source={require('../../assets/icon.png')} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.appName}>Vakit</Text>
          <Text style={styles.tag}>Türkiye Namaz Vakitleri</Text>
        </View>
        <View style={styles.by}><Text style={styles.byText}>by baskaya</Text></View>
      </View>

      <Text style={styles.section}>KONUM</Text>
      <View style={styles.card}>
        <View style={styles.itemRow}>
          <View style={[styles.itemIcon, { backgroundColor: colors.blueSoft }]}><Text style={[styles.itemIconText, { color: colors.blue }]}>⌖</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Aktif konum</Text>
            <Text style={styles.itemSub}>{location.label}</Text>
          </View>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={onOpenLocation}><Text style={styles.secondaryButtonText}>İl / İlçe Seç</Text></TouchableOpacity>
          <TouchableOpacity style={styles.primaryButton} onPress={onDetectLocation} disabled={locating}>
            {locating ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.primaryButtonText}>GPS ile Bul</Text>}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.section}>ANA EKRAN WIDGET'I</Text>
      <View style={styles.widgetCard}>
        <View style={styles.widgetPreview}>
          <Text style={styles.widgetTiny}>Sıradaki</Text>
          <Text style={styles.widgetPrayer}>Akşam</Text>
          <Text style={styles.widgetTime}>19:21</Text>
          <Text style={styles.widgetBy}>by baskaya</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemTitle}>Vakitleri ana ekranda görün</Text>
          <Text style={styles.itemSub}>Android ve iOS'ta widget galerisinden “Vakit” seçin. Konum/vakit değiştiğinde widget güncellenir.</Text>
        </View>
      </View>

      <Text style={styles.section}>VERİ & GİZLİLİK</Text>
      <View style={styles.card}>
        <InfoRow title="Namaz vakti yöntemi" value={PRAYER_SOURCE_NOTE} color={colors.green} />
        <InfoRow title="Dini günler" value="Diyanet yıllık dini günler takvimi" color={colors.orange} />
        <InfoRow title="Konum gizliliği" value="Arka planda konum takibi yapılmaz" color={colors.blue} last />
      </View>

      <View style={styles.privacyNote}>
        <Text style={styles.privacyTitle}>Nasıl çalışır?</Text>
        <Text style={styles.privacyText}>GPS kullanıldığında yalnızca namaz vakitlerini hesaplatmak için koordinat kullanılır. Hesap, üyelik veya reklam takip sistemi yoktur. Vakitler ve seçimler cihazda önbelleğe alınır.</Text>
      </View>

      <Text style={styles.footer}>Vakit • 1.0.0{`\n`}by baskaya</Text>
    </ScrollView>
  );
}

function InfoRow({ title, value, color, last = false }: { title: string; value: string; color: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoBorder]}>
      <View style={[styles.infoDot, { backgroundColor: color }]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSub}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },
  brandCard: { padding: 16, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 58, height: 58, borderRadius: 18 },
  appName: { color: colors.navy, fontSize: 24, fontWeight: '900' },
  tag: { color: colors.muted, fontSize: 10, marginTop: 2 },
  by: { backgroundColor: colors.orangeSoft, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9 },
  byText: { color: colors.orange, fontSize: 8, fontWeight: '900' },
  section: { marginTop: 21, marginBottom: 8, color: colors.muted, fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14 },
  itemRow: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  itemIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  itemIconText: { fontSize: 22, fontWeight: '900' },
  itemTitle: { color: colors.navy, fontSize: 12, fontWeight: '800' },
  itemSub: { color: colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  primaryButton: { flex: 1, minHeight: 42, backgroundColor: colors.blue, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: 'white', fontSize: 11, fontWeight: '800' },
  secondaryButton: { flex: 1, minHeight: 42, backgroundColor: colors.blueSoft, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { color: colors.blue, fontSize: 11, fontWeight: '800' },
  widgetCard: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 13 },
  widgetPreview: { width: 120, height: 110, borderRadius: 22, backgroundColor: colors.blue, padding: 12, overflow: 'hidden' },
  widgetTiny: { color: '#BDD2FF', fontSize: 8, fontWeight: '700' },
  widgetPrayer: { color: 'white', fontSize: 14, fontWeight: '800', marginTop: 7 },
  widgetTime: { color: 'white', fontSize: 27, fontWeight: '900', marginTop: -2 },
  widgetBy: { color: colors.orangeSoft, fontSize: 7, marginTop: 10 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  infoBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  infoDot: { width: 9, height: 9, borderRadius: 5 },
  privacyNote: { marginTop: 14, backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: 14 },
  privacyTitle: { color: colors.green, fontSize: 10, fontWeight: '900' },
  privacyText: { color: colors.text, fontSize: 10, lineHeight: 15, marginTop: 4 },
  footer: { textAlign: 'center', color: '#A0AABB', fontSize: 9, lineHeight: 14, marginTop: 28 },
});
