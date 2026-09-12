import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ReligiousDay } from '../types';
import { colors, radius } from '../theme';

function visualFor(day: ReligiousDay) {
  if (day.category === 'ramazan') {
    return { accent: colors.blue, label: 'RAMAZAN' };
  }
  if (day.category === 'bayram') {
    return { accent: colors.orange, label: 'BAYRAM' };
  }
  if (day.category === 'kandil') {
    return { accent: colors.green, label: 'ÖZEL GECE' };
  }
  return { accent: colors.blue, label: 'DİNİ GÜN' };
}

function formatDateWithWeekday(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(Date.UTC(year!, month! - 1, day!, 12)));
}

export function ReligiousDaysScreen({ days, year, loading }: { days: ReligiousDay[]; year: number; loading: boolean }) {
  const ramadanStart = days.find((day) => day.category === 'ramazan' || /1\s+ramazan|ramazan\s+başlangıcı/i.test(day.title));
  const otherDays = days.filter((day) => day !== ramadanStart);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>DİYANET TAKVİMİ</Text>
      <Text style={styles.title}>{year} Dini Günler</Text>
      <Text style={styles.subtitle}>1 Ramazan’ın miladi karşılığı, Ramazan ve Kurban Bayramları ile kandil geceleri güncel yıl esas alınarak gösterilir.</Text>

      {ramadanStart && (
        <View style={styles.ramadanCard}>
          <View style={styles.ramadanTopRow}>
            <View style={styles.ramadanBadge}><Text style={styles.ramadanBadgeText}>1 RAMAZAN</Text></View>
            <Text style={styles.ramadanYear}>{year}</Text>
          </View>
          <Text style={styles.ramadanTitle}>Ramazan Ayı Başlangıcı</Text>
          <Text style={styles.ramadanDate}>{formatDateWithWeekday(ramadanStart.date)}</Text>
          <Text style={styles.ramadanHint}>Miladi takvime göre Ramazan ayının birinci günü</Text>
        </View>
      )}

      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.blue }]} /><Text style={styles.legendText}>1 Ramazan</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.orange }]} /><Text style={styles.legendText}>Bayram</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: colors.green }]} /><Text style={styles.legendText}>Kandil / Kadir</Text></View>
      </View>

      {loading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.blue} /><Text style={styles.loadingText}>Dini günler yükleniyor…</Text></View>
      ) : days.length ? (
        <View style={styles.timeline}>
          {otherDays.map((day, index) => {
            const { accent, label } = visualFor(day);
            return (
              <View key={day.id} style={styles.row}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.dot, { backgroundColor: accent }]} />
                  {index < otherDays.length - 1 && <View style={styles.line} />}
                </View>
                <View style={[styles.card, { borderLeftColor: accent }]}>
                  <Text style={[styles.category, { color: accent }]}>{label}</Text>
                  <Text style={styles.cardTitle}>{day.title}</Text>
                  <Text style={styles.date}>{formatDateWithWeekday(day.date)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{year} verisi bulunamadı</Text>
          <Text style={styles.emptyText}>İnternet bağlantısı geldiğinde Diyanet dini günler takvimi yeniden okunacaktır.</Text>
        </View>
      )}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>Takvim kaynağı</Text>
        <Text style={styles.noteText}>1 Ramazan ve diğer dini günler Diyanet İşleri Başkanlığı’nın yayımladığı yıllık dini günler takviminden alınır ve son başarılı sonuç cihazda saklanır.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 32 },
  eyebrow: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginTop: 4 },
  title: { color: colors.navy, fontSize: 29, fontWeight: '900', marginTop: 3, letterSpacing: -0.7 },
  subtitle: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8, maxWidth: 340 },
  ramadanCard: { marginTop: 18, backgroundColor: colors.blue, borderRadius: radius.lg, padding: 17, overflow: 'hidden' },
  ramadanTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ramadanBadge: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  ramadanBadgeText: { color: 'white', fontSize: 9, fontWeight: '900', letterSpacing: 1.1 },
  ramadanYear: { color: '#D9E5FF', fontSize: 11, fontWeight: '800' },
  ramadanTitle: { color: 'white', fontSize: 19, fontWeight: '900', marginTop: 12 },
  ramadanDate: { color: 'white', fontSize: 15, fontWeight: '800', marginTop: 5, textTransform: 'capitalize' },
  ramadanHint: { color: '#D9E5FF', fontSize: 10, marginTop: 6 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 18, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.muted, fontSize: 10, fontWeight: '700' },
  loading: { paddingVertical: 80, alignItems: 'center', gap: 10 },
  loadingText: { color: colors.muted, fontSize: 12 },
  timeline: { marginTop: 6 },
  row: { flexDirection: 'row', minHeight: 112 },
  timelineLeft: { width: 26, alignItems: 'center' },
  dot: { width: 12, height: 12, borderRadius: 6, marginTop: 22, zIndex: 2 },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginTop: 3 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderLeftWidth: 4, marginBottom: 10, padding: 14 },
  category: { fontSize: 8, fontWeight: '900', letterSpacing: 1.2 },
  cardTitle: { color: colors.navy, fontSize: 15, fontWeight: '800', marginTop: 4 },
  date: { color: colors.muted, fontSize: 11, marginTop: 5, textTransform: 'capitalize' },
  empty: { marginTop: 30, padding: 24, borderRadius: radius.lg, backgroundColor: colors.surface, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.navy },
  emptyText: { fontSize: 11, color: colors.muted, lineHeight: 17, textAlign: 'center', marginTop: 6 },
  note: { marginTop: 14, backgroundColor: colors.blueSoft, borderRadius: radius.md, padding: 14 },
  noteTitle: { color: colors.blue, fontSize: 10, fontWeight: '800' },
  noteText: { color: colors.text, fontSize: 10, lineHeight: 15, marginTop: 4 },
});
