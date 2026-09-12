import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import type { AlertSettings, PrayerKey } from '../types';
import { PRAYER_KEYS, PRAYER_LABELS } from '../data/defaults';
import { colors, radius } from '../theme';

const OFFSETS = [0, 5, 10, 15, 30, 45, 60];

export function AlertsScreen({
  settings,
  onChange,
  onSave,
  saving,
  scheduledCount,
}: {
  settings: AlertSettings;
  onChange: (settings: AlertSettings) => void;
  onSave: () => Promise<void>;
  saving: boolean;
  scheduledCount?: number;
}) {
  const patch = (key: PrayerKey, value: Partial<AlertSettings[PrayerKey]>) => {
    onChange({ ...settings, [key]: { ...settings[key], ...value } });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>HATIRLATICILAR</Text>
      <Text style={styles.title}>Namaz Bildirimleri</Text>
      <Text style={styles.subtitle}>Her vakit için ayrı süre ve ses seçebilirsiniz. Bildirimler telefon üzerinde yerel olarak zamanlanır.</Text>

      {PRAYER_KEYS.map((key) => {
        const cfg = settings[key];
        return (
          <View key={key} style={[styles.card, cfg.enabled && styles.cardEnabled]}>
            <View style={styles.topRow}>
              <View style={[styles.icon, { backgroundColor: key === 'Maghrib' || key === 'Sunrise' ? colors.orangeSoft : colors.greenSoft }]}>
                <Text style={[styles.iconText, { color: key === 'Maghrib' || key === 'Sunrise' ? colors.orange : colors.green }]}>◷</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.prayer}>{PRAYER_LABELS[key]}</Text>
                <Text style={styles.status}>{cfg.enabled ? (cfg.offsetMinutes ? `${cfg.offsetMinutes} dk önce uyar` : 'Vakit geldiğinde uyar') : 'Kapalı'}</Text>
              </View>
              <Switch
                value={cfg.enabled}
                onValueChange={(value: boolean) => patch(key, { enabled: value })}
                trackColor={{ false: '#D9DEE8', true: '#AFC7FF' }}
                thumbColor={cfg.enabled ? colors.blue : '#FFFFFF'}
              />
            </View>

            {cfg.enabled && (
              <>
                <Text style={styles.miniLabel}>NE ZAMAN?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                  {OFFSETS.map((minutes) => {
                    const selected = cfg.offsetMinutes === minutes;
                    return (
                      <TouchableOpacity key={minutes} onPress={() => patch(key, { offsetMinutes: minutes })} style={[styles.chip, selected && styles.chipSelected]}>
                        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{minutes === 0 ? 'Vaktinde' : `${minutes} dk`}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <View style={styles.soundRow}>
                  <View>
                    <Text style={styles.soundTitle}>Sesli uyarı</Text>
                    <Text style={styles.soundSub}>Telefonun varsayılan bildirim sesi</Text>
                  </View>
                  <Switch
                    value={cfg.sound}
                    onValueChange={(value: boolean) => patch(key, { sound: value })}
                    trackColor={{ false: '#D9DEE8', true: '#BDE9D7' }}
                    thumbColor={cfg.sound ? colors.green : '#FFFFFF'}
                  />
                </View>
              </>
            )}
          </View>
        );
      })}

      <TouchableOpacity disabled={saving} onPress={onSave} style={[styles.save, saving && { opacity: 0.7 }]} activeOpacity={0.85}>
        {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Bildirimleri Kaydet</Text>}
      </TouchableOpacity>
      {typeof scheduledCount === 'number' && (
        <Text style={styles.savedInfo}>{scheduledCount} yaklaşan bildirim telefonda planlandı.</Text>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Not</Text>
        <Text style={styles.infoText}>Android’de tam zamanlı alarm için sistem izni gerekebilir. iOS ve Android enerji tasarrufu kuralları nedeniyle cihaz üreticisi zamanlamayı birkaç saniye/dakika geciktirebilir.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: { color: colors.orange, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 4 },
  title: { color: colors.navy, fontSize: 29, fontWeight: '900', marginTop: 3, letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8, marginBottom: 15 },
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, marginBottom: 11, padding: 14 },
  cardEnabled: { borderColor: '#C9D8F8' },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22, fontWeight: '900' },
  prayer: { color: colors.navy, fontSize: 15, fontWeight: '800' },
  status: { color: colors.muted, fontSize: 10, marginTop: 2 },
  miniLabel: { color: colors.muted, fontSize: 8, fontWeight: '900', letterSpacing: 1.2, marginTop: 15, marginBottom: 7 },
  chips: { gap: 7, paddingRight: 10 },
  chip: { paddingVertical: 7, paddingHorizontal: 11, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.blue, borderColor: colors.blue },
  chipText: { color: colors.text, fontSize: 10, fontWeight: '700' },
  chipTextSelected: { color: 'white' },
  soundRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.border },
  soundTitle: { fontSize: 11, fontWeight: '800', color: colors.text },
  soundSub: { fontSize: 9, color: colors.muted, marginTop: 2 },
  save: { height: 52, borderRadius: 18, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveText: { color: 'white', fontSize: 14, fontWeight: '900' },
  savedInfo: { textAlign: 'center', color: colors.green, fontSize: 10, fontWeight: '700', marginTop: 8 },
  infoBox: { marginTop: 14, backgroundColor: colors.orangeSoft, borderRadius: radius.md, padding: 13 },
  infoTitle: { color: colors.orange, fontSize: 10, fontWeight: '900' },
  infoText: { color: colors.text, fontSize: 10, lineHeight: 15, marginTop: 3 },
});
