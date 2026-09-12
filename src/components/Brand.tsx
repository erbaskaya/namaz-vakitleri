import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <Image source={require('../../assets/icon.png')} style={[styles.logo, compact && styles.logoCompact]} />
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>Vakit</Text>
        {!compact && <Text style={styles.credit}>by baskaya</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 48, height: 48, borderRadius: 15 },
  logoCompact: { width: 36, height: 36, borderRadius: 11 },
  name: { fontSize: 24, fontWeight: '800', color: colors.navy, letterSpacing: -0.5 },
  nameCompact: { fontSize: 20 },
  credit: { fontSize: 10, color: colors.muted, letterSpacing: 0.7, marginTop: -1 },
});
