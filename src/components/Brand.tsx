import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <Image source={require('../../assets/icon.png')} style={[styles.logo, compact && styles.logoCompact]} />
      <View style={styles.textBlock}>
        <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={1}>Namaz Vakti</Text>
        {!compact && <Text style={styles.subtitle}>ve Dini Günler</Text>}
        {!compact && <Text style={styles.credit}>by baskaya</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 9, flexShrink: 1 },
  logo: { width: 46, height: 46, borderRadius: 14 },
  logoCompact: { width: 36, height: 36, borderRadius: 11 },
  textBlock: { flexShrink: 1 },
  name: { fontSize: 17, fontWeight: '900', color: colors.navy, letterSpacing: -0.3 },
  nameCompact: { fontSize: 18 },
  subtitle: { fontSize: 10, fontWeight: '700', color: colors.green, marginTop: 0 },
  credit: { fontSize: 8, color: colors.muted, letterSpacing: 0.6, marginTop: 1 },
});
