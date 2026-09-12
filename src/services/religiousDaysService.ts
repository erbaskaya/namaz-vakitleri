import type { ReligiousDay } from '../types';
import { readJson, writeJson } from './storage';

const DIYANET_URL = 'https://mobil.diyanet.gov.tr/mobile/dinigunler/dinigunler.html';
const MONTHS: Record<string, number> = {
  Ocak: 1, Şubat: 2, Mart: 3, Nisan: 4, Mayıs: 5, Haziran: 6,
  Temmuz: 7, Ağustos: 8, Eylül: 9, Ekim: 10, Kasım: 11, Aralık: 12,
};

const FALLBACK: Record<number, ReligiousDay[]> = {
  2026: [
    ['2026-01-15','Miraç Kandili','kandil'],
    ['2026-02-02','Berat Kandili','kandil'],
    ['2026-02-19','Ramazan Başlangıcı','ramazan'],
    ['2026-03-16','Kadir Gecesi','kandil'],
    ['2026-03-20','Ramazan Bayramı • 1. Gün','bayram'],
    ['2026-03-21','Ramazan Bayramı • 2. Gün','bayram'],
    ['2026-03-22','Ramazan Bayramı • 3. Gün','bayram'],
    ['2026-05-27','Kurban Bayramı • 1. Gün','bayram'],
    ['2026-05-28','Kurban Bayramı • 2. Gün','bayram'],
    ['2026-05-29','Kurban Bayramı • 3. Gün','bayram'],
    ['2026-05-30','Kurban Bayramı • 4. Gün','bayram'],
    ['2026-08-24','Mevlid Kandili','kandil'],
    ['2026-12-10','Regaib Kandili','kandil'],
  ].map(([date,title,category], i) => ({ id:`2026-${i}`, date, title, category: category as ReligiousDay['category'] })),
  2027: [
    ['2027-01-04','Miraç Kandili','kandil'],
    ['2027-01-22','Berat Kandili','kandil'],
    ['2027-02-08','Ramazan Başlangıcı','ramazan'],
    ['2027-03-05','Kadir Gecesi','kandil'],
    ['2027-03-09','Ramazan Bayramı • 1. Gün','bayram'],
    ['2027-03-10','Ramazan Bayramı • 2. Gün','bayram'],
    ['2027-03-11','Ramazan Bayramı • 3. Gün','bayram'],
    ['2027-05-16','Kurban Bayramı • 1. Gün','bayram'],
    ['2027-05-17','Kurban Bayramı • 2. Gün','bayram'],
    ['2027-05-18','Kurban Bayramı • 3. Gün','bayram'],
    ['2027-05-19','Kurban Bayramı • 4. Gün','bayram'],
    ['2027-08-13','Mevlid Kandili','kandil'],
    ['2027-12-02','Regaib Kandili','kandil'],
    ['2027-12-24','Miraç Kandili','kandil'],
  ].map(([date,title,category], i) => ({ id:`2027-${i}`, date, title, category: category as ReligiousDay['category'] })),
  2028: [
    ['2028-01-28','Ramazan Başlangıcı','ramazan'],
    ['2028-02-22','Kadir Gecesi','kandil'],
    ['2028-02-26','Ramazan Bayramı • 1. Gün','bayram'],
    ['2028-02-27','Ramazan Bayramı • 2. Gün','bayram'],
    ['2028-02-28','Ramazan Bayramı • 3. Gün','bayram'],
    ['2028-05-05','Kurban Bayramı • 1. Gün','bayram'],
    ['2028-05-06','Kurban Bayramı • 2. Gün','bayram'],
    ['2028-05-07','Kurban Bayramı • 3. Gün','bayram'],
    ['2028-05-08','Kurban Bayramı • 4. Gün','bayram'],
    ['2028-08-02','Mevlid Kandili','kandil'],
  ].map(([date,title,category], i) => ({ id:`2028-${i}`, date, title, category: category as ReligiousDay['category'] })),
};

function cleanHtml(value: string): string {
  return value
    .replace(/<br\s*\/?\s*>/gi, ' | ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&ccedil;/gi, 'ç')
    .replace(/&Ccedil;/g, 'Ç')
    .replace(/&ouml;/gi, 'ö')
    .replace(/&uuml;/gi, 'ü')
    .replace(/&Ouml;/g, 'Ö')
    .replace(/&Uuml;/g, 'Ü')
    .replace(/&#351;/g, 'ş')
    .replace(/&#350;/g, 'Ş')
    .replace(/&#305;/g, 'ı')
    .replace(/&#304;/g, 'İ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryFor(title: string): ReligiousDay['category'] {
  if (/ramazan\s+başlangıcı/i.test(title)) return 'ramazan';
  if (/bayram/i.test(title)) return 'bayram';
  if (/kandil|kadir gecesi/i.test(title)) return 'kandil';
  return 'other';
}


function expandRange(year: number, month: number, dayText: string, title: string): ReligiousDay[] {
  const nums = dayText.match(/\d{1,2}/g)?.map(Number) ?? [];
  if (!nums.length) return [];
  const start = nums[0]!;
  const end = nums.length > 1 ? nums[nums.length - 1]! : start;
  const days: number[] = [];
  if (end >= start) for (let d = start; d <= end; d++) days.push(d);
  else days.push(start); // Ay taşan eski tablolar için güvenli tek-gün dönüşü.
  return days.map((day, index) => ({
    id: `${year}-${month}-${day}-${title}`,
    date: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
    title: days.length > 1 ? `${title} • ${index + 1}. Gün` : title,
    category: categoryFor(title),
  }));
}

function parseDiyanetHtml(html: string, year: number): ReligiousDay[] {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) ?? [];
  const wanted = /ramazan\s+başlangıcı|kandil|kadir gecesi|ramazan bayramı|kurban bayramı/i;
  const result: ReligiousDay[] = [];
  for (const row of rows) {
    const cells = (row.match(/<td[\s\S]*?<\/td>/gi) ?? []).map(cleanHtml);
    if (cells.length < 3) continue;
    const combined = cells.join(' | ');
    if (!combined.includes(String(year))) continue;
    const titleCell = cells.find((c) => wanted.test(c)) ?? '';
    const title = titleCell.split('|')[0]!.trim();
    if (!wanted.test(title)) continue;
    const monthName = Object.keys(MONTHS).find((m) => combined.includes(m));
    const dayCell = cells.find((c) => /^\s*\d/.test(c)) ?? '';
    if (!monthName || !dayCell) continue;
    const month = MONTHS[monthName]!;
    result.push(...expandRange(year, month, dayCell, title));
  }
  const unique = new Map(result.map((d) => [`${d.date}-${d.title}`, d]));
  return [...unique.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getReligiousDays(year: number): Promise<ReligiousDay[]> {
  // v2: Ramazan Başlangıcı eklendi. Eski eksik önbelleği tekrar kullanmamak için anahtar sürümlendi.
  const cacheKey = `@vakit/religious-days/v2/${year}`;
  const cached = await readJson<ReligiousDay[]>(cacheKey, []);
  try {
    const response = await fetch(DIYANET_URL);
    if (!response.ok) throw new Error('Diyanet dini günler sayfası alınamadı.');
    const html = await response.text();
    const parsed = parseDiyanetHtml(html, year);
    if (parsed.length >= 5) {
      await writeJson(cacheKey, parsed);
      return parsed;
    }
  } catch {
    // Son başarılı Diyanet verisi veya uygulama içi doğrulanmış yedek liste kullanılır.
  }
  if (cached.length) return cached;
  return FALLBACK[year] ?? [];
}
