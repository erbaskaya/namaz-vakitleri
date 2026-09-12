import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme';

export type TabKey = 'home' | 'days' | 'alerts' | 'settings';

const TABS: Array<{ key: TabKey; label: string; icon: string }> = [
  { key: 'home', label: 'Vakitler', icon: '◷' },
  { key: 'days', label: 'Dini Günler', icon: '☾' },
  { key: 'alerts', label: 'Bildirim', icon: '♢' },
  { key: 'settings', label: 'Ayarlar', icon: '⚙' },
];

export function BottomNav({ active, onChange }: { active: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <View style={styles.wrap}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <TouchableOpacity key={tab.key} onPress={() => onChange(tab.key)} activeOpacity={0.75} style={styles.item}>
            <View style={[styles.iconBox, selected && styles.iconBoxSelected]}>
              <Text style={[styles.icon, selected && styles.iconSelected]}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  iconBox: { width: 38, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconBoxSelected: { backgroundColor: colors.blueSoft },
  icon: { fontSize: 20, color: colors.muted },
  iconSelected: { color: colors.blue, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '600', color: colors.muted },
  labelSelected: { color: colors.blue, fontWeight: '800' },
});
