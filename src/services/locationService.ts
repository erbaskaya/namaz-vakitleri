import * as Location from 'expo-location';
import type { District, Province, SelectedLocation } from '../types';
import { OFFLINE_PROVINCES } from '../data/provinces';
import { readJson, writeJson } from './storage';

const API = 'https://api.turkiyeapi.dev/v2';
const PROVINCES_CACHE = '@vakit/provinces-v2';
const DISTRICTS_CACHE_PREFIX = '@vakit/districts-v2/';

function normalizeProvince(item: any): Province {
  const coordinates = item?.coordinates ?? item?.coordinate ?? {};
  return {
    id: Number(item.id),
    name: String(item.name),
    latitude: Number(coordinates.latitude ?? coordinates.lat) || undefined,
    longitude: Number(coordinates.longitude ?? coordinates.lng ?? coordinates.lon) || undefined,
  };
}

export async function getProvinces(): Promise<Province[]> {
  const cached = await readJson<Province[]>(PROVINCES_CACHE, []);
  try {
    const response = await fetch(`${API}/provinces?limit=100&fields=id,name,coordinates`);
    if (!response.ok) throw new Error('İl listesi alınamadı.');
    const json = await response.json();
    const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const provinces = rows.map(normalizeProvince).filter((p: Province) => p.id && p.name);
    if (provinces.length >= 81) {
      provinces.sort((a: Province, b: Province) => a.name.localeCompare(b.name, 'tr'));
      await writeJson(PROVINCES_CACHE, provinces);
      return provinces;
    }
  } catch {
    // Aşağıdaki cache/offline dönüşleri uygulamanın konum seçimini çalışır tutar.
  }
  if (cached.length) return cached;
  return [...OFFLINE_PROVINCES].sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export async function getDistricts(provinceId: number): Promise<District[]> {
  const cacheKey = `${DISTRICTS_CACHE_PREFIX}${provinceId}`;
  const cached = await readJson<District[]>(cacheKey, []);
  try {
    const response = await fetch(`${API}/provinces/${provinceId}/districts?limit=1000&fields=id,name,provinceId`);
    if (!response.ok) throw new Error('İlçe listesi alınamadı.');
    const json = await response.json();
    const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    const districts: District[] = rows
      .map((item: any) => ({
        id: Number(item.id),
        name: String(item.name),
        provinceId: Number(item.provinceId ?? provinceId),
      }))
      .filter((d: District) => d.id && d.name)
      .sort((a: District, b: District) => a.name.localeCompare(b.name, 'tr'));
    if (districts.length) {
      await writeJson(cacheKey, districts);
      return districts;
    }
  } catch {
    // Çevrimdışı kullanımda daha önce kaydedilen ilçe listesi kullanılır.
  }
  return cached;
}

export async function detectCurrentLocation(): Promise<SelectedLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (permission.status !== 'granted') {
    throw new Error('Konum izni verilmedi. İl/ilçe seçimini kullanabilirsiniz.');
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const { latitude, longitude } = position.coords;

  let label = 'Mevcut Konum';
  let province: string | undefined;
  let district: string | undefined;
  try {
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
    const address = addresses[0];
    province = address?.region ?? address?.city ?? undefined;
    district = address?.district ?? address?.subregion ?? undefined;
    label = [district, province].filter(Boolean).join(', ') || label;
  } catch {
    // Koordinatlar namaz vakti hesabı için tek başına yeterlidir.
  }

  return {
    mode: 'gps',
    label,
    province,
    district,
    latitude,
    longitude,
  };
}

export function provinceCenterLocation(province: Province): SelectedLocation {
  return {
    mode: 'manual',
    label: `${province.name} Merkez`,
    province: province.name,
    provinceId: province.id,
    latitude: province.latitude,
    longitude: province.longitude,
    address: `${province.name}, Türkiye`,
  };
}

export function districtLocation(province: Province, district: District): SelectedLocation {
  return {
    mode: 'manual',
    label: `${district.name}, ${province.name}`,
    province: province.name,
    provinceId: province.id,
    district: district.name,
    address: `${district.name}, ${province.name}, Türkiye`,
  };
}
