/* ── Renk adı → canonical isim eşlemesi ──────────────────────────── */
export const COLOR_NAME_MAP: Record<string, string> = {
  'siyah': 'Siyah', 'si̇yah': 'Siyah',
  'beyaz': 'Beyaz',
  'gri': 'Gri',
  'mavi': 'Mavi',
  'kırmızı': 'Kırmızı', 'kirmizi': 'Kırmızı',
  'mor': 'Mor',
  'pembe': 'Pembe',
  'yeşil': 'Yeşil', 'yesil': 'Yeşil',
  'lacivert': 'Lacivert',
  'kahverengi': 'Kahverengi',
  'bej': 'Bej',
  'bordo': 'Bordo',
  'sarı': 'Sarı', 'sari': 'Sarı',
  'ekru': 'Ekru',
  'haki': 'Haki',
  'turuncu': 'Turuncu',
  'antrasit': 'Antrasit',
  'koyu yeşil': 'Koyu Yeşil', 'koyu yesil': 'Koyu Yeşil',
  'saks mavi': 'Saks Mavisi', 'saks mavisi': 'Saks Mavisi',
  'bebe mavisi': 'Bebe Mavisi', 'bebe mavi': 'Bebe Mavisi',
  'indigo mavi': 'İndigo Mavi', 'i̇ndigo mavi': 'İndigo Mavi',
  'çok renkli': 'Çok Renkli', 'cok renkli': 'Çok Renkli',
  'siyah-beyaz': 'Siyah-Beyaz', 'beyaz-siyah': 'Siyah-Beyaz',
  'kırmızı-siyah': 'Kırmızı-Siyah', 'siyah-kırmızı': 'Kırmızı-Siyah',
  'lacivert-siyah': 'Lacivert-Siyah', 'siyah-lacivert': 'Lacivert-Siyah',
  'sarı-siyah': 'Sarı-Siyah', 'siyah-sarı': 'Sarı-Siyah',
}

/* ── Canonical renk adı → hex renk kodu ─────────────────────────── */
export const COLOR_HEX_MAP: Record<string, string> = {
  'Siyah':           '#1a1a1a',
  'Beyaz':           '#FFFFFF',
  'Gri':             '#9ca3af',
  'Mavi':            '#3b82f6',
  'Kırmızı':         '#ef4444',
  'Mor':             '#8b5cf6',
  'Pembe':           '#f472b6',
  'Yeşil':           '#22c55e',
  'Lacivert':        '#1e3a5f',
  'Kahverengi':      '#92400e',
  'Bej':             '#d4b896',
  'Bordo':           '#7f1d1d',
  'Sarı':            '#facc15',
  'Ekru':            '#f5f0e8',
  'Haki':            '#78716c',
  'Turuncu':         '#f97316',
  'Antrasit':        '#374151',
  'Koyu Yeşil':      '#14532d',
  'Saks Mavisi':     '#4682B4',
  'Bebe Mavisi':     '#a8d8ea',
  'İndigo Mavi':     '#4f46e5',
  'Çok Renkli':      '#ff6b6b',
  'Siyah-Beyaz':     '#888888',
  'Kırmızı-Siyah':   '#7f1d1d',
  'Lacivert-Siyah':  '#1e3a5f',
  'Sarı-Siyah':      '#854d0e',
}

export const CANONICAL_COLORS = Object.keys(COLOR_HEX_MAP)

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

export function normalizeColor(raw: string): string {
  const trimmed = raw.trim()
  const withoutDigits = trimmed.replace(/\d+$/, '').trim()
  if (!withoutDigits) return trimmed
  const lower = withoutDigits
    .replace(/İ/g, 'i').replace(/I/g, 'ı')
    .toLowerCase()
  if (COLOR_NAME_MAP[lower]) return COLOR_NAME_MAP[lower]
  return withoutDigits.charAt(0).toUpperCase() + withoutDigits.slice(1)
}
