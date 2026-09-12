import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { District, Province, SelectedLocation } from '../types';
import { colors, radius } from '../theme';
import { districtLocation, getDistricts, getProvinces, provinceCenterLocation } from '../services/locationService';

function normalize(value: string) {
  return value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function LocationPicker({
  visible,
  onClose,
  onSelect,
  onAutoDetect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (location: SelectedLocation) => void;
  onAutoDetect: () => Promise<void>;
}) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [province, setProvince] = useState<Province | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setProvince(null);
    setQuery('');
    setLoading(true);
    getProvinces().then(setProvinces).finally(() => setLoading(false));
  }, [visible]);

  const filteredProvinces = useMemo(() => {
    const q = normalize(query.trim());
    return q ? provinces.filter((item) => normalize(item.name).includes(q)) : provinces;
  }, [provinces, query]);

  const filteredDistricts = useMemo(() => {
    const q = normalize(query.trim());
    return q ? districts.filter((item) => normalize(item.name).includes(q)) : districts;
  }, [districts, query]);

  const chooseProvince = async (item: Province) => {
    setProvince(item);
    setQuery('');
    setLoading(true);
    try {
      setDistricts(await getDistricts(item.id));
    } finally {
      setLoading(false);
    }
  };

  const handleAuto = async () => {
    setAutoLoading(true);
    try {
      await onAutoDetect();
      onClose();
    } finally {
      setAutoLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>KONUM</Text>
            <Text style={styles.title}>{province ? province.name : 'İl veya konum seçin'}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.autoCard} onPress={handleAuto} disabled={autoLoading} activeOpacity={0.8}>
          <View style={styles.autoIcon}><Text style={styles.autoIconText}>◎</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.autoTitle}>Konumumu otomatik bul</Text>
            <Text style={styles.autoSub}>GPS ile bulunduğunuz yere ait vakitleri getir</Text>
          </View>
          {autoLoading ? <ActivityIndicator color={colors.blue} /> : <Text style={styles.chevron}>›</Text>}
        </TouchableOpacity>

        {province && (
          <TouchableOpacity style={styles.backRow} onPress={() => { setProvince(null); setQuery(''); }}>
            <Text style={styles.backText}>‹ İllere dön</Text>
          </TouchableOpacity>
        )}

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={province ? `${province.name} ilçesi ara...` : 'İl ara...'}
            placeholderTextColor="#98A3B8"
            style={styles.input}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {!!query && <TouchableOpacity onPress={() => setQuery('')}><Text style={styles.clear}>×</Text></TouchableOpacity>}
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.blue} /><Text style={styles.loadingText}>Konumlar hazırlanıyor…</Text></View>
        ) : province ? (
          <FlatList
            data={filteredDistricts}
            keyExtractor={(item: District) => String(item.id)}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <TouchableOpacity style={[styles.row, styles.centerRow]} onPress={() => onSelect(provinceCenterLocation(province))}>
                <View style={[styles.dot, { backgroundColor: colors.orange }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{province.name} Merkez</Text>
                  <Text style={styles.rowSub}>İl merkezi</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            }
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>İlçe listesi çevrimdışı değil</Text>
                <Text style={styles.emptyText}>Bu il için ilçeleri ilk kez açarken internet bağlantısı gerekir. Sonrasında liste cihazda saklanır.</Text>
              </View>
            }
            renderItem={({ item }: { item: District }) => (
              <TouchableOpacity style={styles.row} onPress={() => onSelect(districtLocation(province, item))}>
                <View style={styles.dot} />
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        ) : (
          <FlatList
            data={filteredProvinces}
            keyExtractor={(item: Province) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: Province }) => (
              <TouchableOpacity style={styles.row} onPress={() => chooseProvince(item)}>
                <View style={styles.provinceBadge}><Text style={styles.provinceBadgeText}>{String(item.id).padStart(2, '0')}</Text></View>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16 },
  eyebrow: { fontSize: 10, letterSpacing: 1.6, fontWeight: '800', color: colors.green },
  title: { fontSize: 24, fontWeight: '800', color: colors.navy, marginTop: 2 },
  close: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 28, color: colors.muted, lineHeight: 30 },
  autoCard: { marginHorizontal: 18, padding: 15, borderRadius: radius.lg, backgroundColor: colors.blueSoft, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#D7E4FF' },
  autoIcon: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  autoIconText: { color: 'white', fontSize: 24, fontWeight: '800' },
  autoTitle: { fontSize: 14, fontWeight: '800', color: colors.navy },
  autoSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  backRow: { marginHorizontal: 20, marginTop: 12 },
  backText: { fontSize: 13, color: colors.blue, fontWeight: '700' },
  searchBox: { marginHorizontal: 18, marginTop: 14, height: 50, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 9 },
  searchIcon: { fontSize: 22, color: colors.blue },
  input: { flex: 1, fontSize: 15, color: colors.navy, paddingVertical: 0 },
  clear: { fontSize: 22, color: colors.muted },
  listContent: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 30 },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 14 },
  centerRow: { borderRadius: radius.md, marginBottom: 10, borderBottomWidth: 0 },
  provinceBadge: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  provinceBadgeText: { color: colors.green, fontSize: 11, fontWeight: '800' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.green },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 10, color: colors.muted, marginTop: 1 },
  chevron: { fontSize: 26, color: colors.muted },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.muted, fontSize: 12 },
  empty: { padding: 24, alignItems: 'center' },
  emptyTitle: { color: colors.navy, fontWeight: '800', marginBottom: 5 },
  emptyText: { textAlign: 'center', color: colors.muted, fontSize: 12, lineHeight: 18 },
});
