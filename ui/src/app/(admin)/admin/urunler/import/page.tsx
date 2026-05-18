'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft, Upload, FileSpreadsheet, CheckCircle2, XCircle,
  Loader2, ChevronRight, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'

/* ── Trendyol sütun indexleri (17 kolon format) ─────────────────────
 * [0] Barkod           [1] Model Kodu      [2] Ürün Rengi
 * [3] Beden            [4] Cinsiyet        [5] Marka
 * [6] Kategori İsmi    [7] Tedarikçi Kodu  [8] Ürün Adı
 * [9] Ürün Açıklaması  [10] Fiyat          [11] Stok
 * [12-16] Görsel 1-5
 * ─────────────────────────────────────────────────────────────────── */
const COL = {
  BARKOD:      0,
  MODEL_KODU:  1,
  RENK:        2,
  BEDEN:       3,
  CINSIYET:    4,
  MARKA:       5,
  KATEGORI:    6,
  URUN_ADI:    8,
  ACIKLAMA:    9,
  SATIS_FIYAT: 10,
  STOK:        11,
  GORSEL_1:    12,
  GORSEL_2:    13,
  GORSEL_3:    14,
  GORSEL_4:    15,
  GORSEL_5:    16,
}

/* ── Renk adı → canonical isim eşlemesi ──────────────────────────── */
const COLOR_NAME_MAP: Record<string, string> = {
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
const COLOR_HEX_MAP: Record<string, string> = {
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

function normalizeColor(raw: string): string {
  const trimmed = raw.trim()
  const withoutDigits = trimmed.replace(/\d+$/, '').trim()
  if (!withoutDigits) return trimmed
  const lower = withoutDigits
    .replace(/İ/g, 'i').replace(/I/g, 'ı')
    .toLowerCase()
  if (COLOR_NAME_MAP[lower]) return COLOR_NAME_MAP[lower]
  return withoutDigits.charAt(0).toUpperCase() + withoutDigits.slice(1)
}

function normalizeCategoryName(raw: string): string {
  return raw
    .replace(/büyük beden\s*/i, '')
    .replace(/eşofman takımı/i, 'Eşofman')
    .replace(/alt\s*-\s*üst takım/i, 'Eşofman')
    .replace(/şort\s*&\s*bermuda/i, 'Şort')
    .trim()
}

function normalizeGender(raw: string): string {
  if (/kadın|kız/i.test(raw)) return 'Kadın'
  if (/erkek/i.test(raw)) return 'Erkek'
  return 'Unisex'
}

/* ── Veri tipleri ──────────────────────────────────────────────────── */

/**
 * Tek bir kombinasyon SKU.
 * Excel'deki her satır = 1 ParsedVariant.
 * color ve size AYNI objede tutulur — asla ayrılmaz.
 */
interface ParsedVariant {
  barkod:   string
  renk:     string        // normalize edilmiş renk adı (örn: "Lacivert")
  beden:    string        // beden değeri (örn: "M")
  stock:    number
  colorHex: string | undefined
  /** Görüntülenecek birleşik ad: "Lacivert - M" */
  label:    string
}

interface ParsedProduct {
  modelKodu:    string
  name:         string
  description:  string
  price:        number
  stock:        number
  sku:          string
  categoryName: string
  gender:       string
  images:       string[]
  /** Her satır = 1 kombinasyon varyantı */
  variants:     ParsedVariant[]
  isActive:     boolean
}

interface ImportResult {
  modelKodu: string
  name:      string
  status:    'success' | 'error' | 'pending'
  message?:  string
}

/* ── Excel parse — TEK KOMBINASYON MANTIGI ──────────────────────────
 *
 * Her Excel satırı, aynı anda hem renk hem beden içerir.
 * Bu fonksiyon renk/beden listelerini AYRI DİZİLERE KOYMAZ.
 * Bunun yerine her satırdan 1 ParsedVariant üretir:
 *   { renk: "Lacivert", beden: "M", barkod: "BAR001", ... }
 *
 * ──────────────────────────────────────────────────────────────────── */
function parseExcel(rows: unknown[][]): ParsedProduct[] {
  // Model kodu ile grupla
  const groups = new Map<string, unknown[][]>()
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[]
    const modelKodu = String(row[COL.MODEL_KODU] ?? '').trim()
    if (!modelKodu) continue
    if (!groups.has(modelKodu)) groups.set(modelKodu, [])
    groups.get(modelKodu)!.push(row)
  }

  const products: ParsedProduct[] = []

  groups.forEach((groupRows, modelKodu) => {
    const first = groupRows[0] as unknown[]

    const name = String(first[COL.URUN_ADI] ?? '').trim()
    if (!name) return

    const price = parseFloat(String(first[COL.SATIS_FIYAT] ?? '0')) || 0

    // Görseller — tüm satırlarda dolu URL'leri topla (dedupe)
    const imageSet = new Set<string>()
    for (const r of groupRows) {
      for (const idx of [COL.GORSEL_1, COL.GORSEL_2, COL.GORSEL_3, COL.GORSEL_4, COL.GORSEL_5]) {
        const url = String((r as unknown[])[idx] ?? '').trim()
        if (url.startsWith('http')) imageSet.add(url)
      }
    }
    const images = [...imageSet].slice(0, 8)

    // ── KOMBİNASYON VARYANTLARI: her satır = 1 variant ──────────────
    // Renk ve beden AYNI satırdan, AYNI variant objesine yazılır.
    // Hiçbir zaman sizes[] + colors[] şeklinde ayrılmaz.
    const variants: ParsedVariant[] = groupRows.map(r => {
      const rawRenk  = String((r as unknown[])[COL.RENK]   ?? '').trim()
      const rawBeden = String((r as unknown[])[COL.BEDEN]  ?? '').trim()
      const barkod   = String((r as unknown[])[COL.BARKOD] ?? '').trim()
      const stock    = parseInt(String((r as unknown[])[COL.STOK] ?? '0')) || 0

      const renk     = rawRenk ? normalizeColor(rawRenk) : ''
      const colorHex = renk ? (COLOR_HEX_MAP[renk] ?? undefined) : undefined

      // "Lacivert - M"  |  "Lacivert"  |  "M"  |  "Standart"
      const label = renk && rawBeden
        ? `${renk} - ${rawBeden}`
        : renk || rawBeden || 'Standart'

      return { barkod, renk, beden: rawBeden, stock, colorHex, label }
    })

    // Toplam stok = varyant stoklarının toplamı (sıfırdan küçük olamaz)
    const totalStock = Math.max(variants.reduce((s, v) => s + v.stock, 0), 0)

    const rawCategory = String(first[COL.KATEGORI] ?? '').trim()
    const rawGender   = String(first[COL.CINSIYET] ?? '').trim()

    products.push({
      modelKodu,
      name,
      description: String(first[COL.ACIKLAMA] ?? '').trim() || name,
      price,
      stock: totalStock,
      sku: modelKodu,
      categoryName: normalizeCategoryName(rawCategory),
      gender: normalizeGender(rawGender),
      images,
      variants,
      isActive: true,
    })
  })

  return products
}

/* ── Bileşen ──────────────────────────────────────────────────────── */
export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver]   = useState(false)
  const [parsed, setParsed]       = useState<ParsedProduct[] | null>(null)
  const [results, setResults]     = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone]           = useState(false)
  const [progress, setProgress]   = useState(0)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx')) {
      toast.error('Sadece .xlsx dosyası destekleniyor')
      return
    }
    try {
      const { read, utils } = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb  = read(buf)
      const ws  = wb.Sheets[wb.SheetNames[0]]
      const rows = utils.sheet_to_json<unknown[]>(ws, { header: 1 })
      const products = parseExcel(rows)
      setParsed(products)
      setResults([])
      setDone(false)
      setProgress(0)
      toast.success(`${products.length} benzersiz ürün tespit edildi`)
    } catch {
      toast.error('Dosya okunamadı')
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  /* ── İÇE AKTARMA: TEK KOMBİNASYON MANTIGI ──────────────────────────
   *
   * Her ParsedVariant için TEK BİR adminApi.createVariant çağrısı yapılır.
   * color ve size AYNI request objesine yazılır.
   * SIZE döngüsü + COLOR döngüsü YOKTUR.
   *
   * ─────────────────────────────────────────────────────────────────── */
  const startImport = async () => {
    if (!parsed?.length) return
    setImporting(true)
    setDone(false)
    const res: ImportResult[] = parsed.map(p => ({
      modelKodu: p.modelKodu,
      name: p.name,
      status: 'pending',
    }))
    setResults([...res])

    for (let i = 0; i < parsed.length; i++) {
      const p = parsed[i]
      try {
        // Kategori eşleştir
        const catNorm = p.categoryName.toLowerCase()
        const cat = categories.find(c => c.name.toLowerCase() === catNorm)
          ?? categories.find(c => c.name.toLowerCase().includes(catNorm))
          ?? categories.find(c => catNorm.includes(c.name.toLowerCase()))
        const categoryId = cat?.id ?? categories[0]?.id ?? 1

        // Ürünü oluştur
        const product = await adminApi.createProduct({
          name:        p.name,
          description: p.description.length >= 10
            ? p.description
            : p.name + ' — detaylı açıklama ekleyin',
          price:       p.price,
          stock:       p.stock,
          sku:         p.sku,
          categoryId,
          gender:      p.gender || undefined,
          isActive:    p.isActive,
        })

        // Görseller
        for (let imgIdx = 0; imgIdx < p.images.length; imgIdx++) {
          try {
            await adminApi.addProductImage(product.id, p.images[imgIdx], imgIdx === 0)
          } catch { /* görsel hataları sessizce atla */ }
        }

        // ── KOMBİNASYON VARYANTLARl ────────────────────────────────
        // Her variant = 1 createVariant çağrısı.
        // color ve size AYNI objeye, AYNI anda gönderilir.
        // ÖRN: { variantType:'color-size', name:'Lacivert - M',
        //         color:'Lacivert', size:'M', sku:'BAR001', stock:10 }
        for (const v of p.variants) {
          try {
            await adminApi.createVariant(product.id, {
              variantType: 'COMBINED',
              name:        v.label,
              color:       v.renk   || undefined,
              colorHex:    v.colorHex,
              size:        v.beden  || undefined,
              ...(v.barkod ? { sku: v.barkod } : {}),
              stock:       v.stock,
            })
          } catch { /* devam */ }
        }

        res[i] = { ...res[i], status: 'success' }
      } catch (err: unknown) {
        const msg = (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Oluşturulamadı'
        res[i] = { ...res[i], status: 'error', message: msg }
      }

      setResults([...res])
      setProgress(Math.round(((i + 1) / parsed.length) * 100))
    }

    setImporting(false)
    setDone(true)
    const successCount = res.filter(r => r.status === 'success').length
    const failCount    = res.filter(r => r.status === 'error').length
    toast.success(`İçe aktarma tamamlandı: ${successCount} başarılı, ${failCount} hatalı`)
  }

  const successCount   = results.filter(r => r.status === 'success').length
  const errorCount     = results.filter(r => r.status === 'error').length
  const totalVariants  = parsed ? parsed.reduce((s, p) => s + p.variants.length, 0) : 0
  const totalImages    = parsed ? parsed.reduce((s, p) => s + p.images.length, 0) : 0

  return (
    <div className="max-w-[860px] space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link href="/admin/urunler" className="text-gray-400 hover:text-orange">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-navy-dark">Excel&apos;den İçe Aktar</h1>
          <p className="text-xs text-gray-400 mt-0.5">Trendyol satıcı paneli export formatı desteklenir</p>
        </div>
      </div>

      {/* Format bilgisi */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-sm font-bold text-blue-700 mb-1 flex items-center gap-2">
          <AlertCircle size={15} /> Desteklenen Format
        </p>
        <p className="text-xs text-blue-600 leading-relaxed">
          Trendyol Satıcı Paneli → Ürün Yönetimi → Excel İndir (.xlsx) formatı.
          Her satır bir <strong>Kombine SKU</strong> (renk + beden birlikte).
          Aynı Model Kodu altındaki satırlar tek ürün altında gruplanır.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {['Model Kodu (SKU)', 'Ürün Adı', 'Fiyat', 'Stok', 'Kategori',
            'Görseller (5)', 'Renk + Beden (Kombine)', 'Cinsiyet'].map(f => (
            <span key={f} className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Dosya yükleme */}
      {!parsed && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-colors
                       ${dragOver ? 'border-orange bg-orange/5' : 'border-gray-200 hover:border-orange'}`}
        >
          <FileSpreadsheet size={36} className={`mx-auto mb-3 ${dragOver ? 'text-orange' : 'text-gray-300'}`} />
          <p className="text-sm font-semibold text-gray-600">
            .xlsx dosyasını sürükleyin veya{' '}
            <span className="text-orange">tıklayın</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Trendyol export formatı (.xlsx)</p>
          <input ref={fileRef} type="file" accept=".xlsx" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {/* Önizleme */}
      {parsed && !importing && !done && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-navy-dark">Dosya Analizi Tamamlandı</h2>
              <p className="text-xs text-gray-400 mt-0.5">{parsed.length} benzersiz ürün (model kodu) bulundu</p>
            </div>
            <button
              onClick={() => { setParsed(null); setResults([]) }}
              className="text-xs text-gray-400 hover:text-orange"
            >
              Farklı dosya seç
            </button>
          </div>

          {/* İstatistik kartları */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-orange/5 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-orange">{parsed.length}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Ürün</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-navy-dark">{totalVariants}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Kombine SKU</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-navy-dark">{totalImages}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Görsel URL</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-navy-dark">
                {new Set(parsed.flatMap(p => p.variants.map(v => v.renk)).filter(Boolean)).size}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">Renk (unique)</p>
            </div>
          </div>

          {/* İlk 8 ürün önizlemesi */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">Önizleme (ilk 8 ürün)</p>
            {parsed.slice(0, 8).map((p) => (
              <div key={p.modelKodu} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                {p.images[0] ? (
                  <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center flex-shrink-0
                                  text-sm font-bold text-orange">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-gray-500">{p.price}₺</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-500">{p.variants.length} SKU</span>
                    <span className="text-gray-300">·</span>
                    {/* Renk swatches (ilk 6 unique renk) */}
                    <span className="flex items-center gap-0.5">
                      {[...new Map(p.variants.filter(v => v.renk).map(v => [v.renk, v])).values()]
                        .slice(0, 6)
                        .map(v => (
                          <span
                            key={v.renk}
                            title={v.renk}
                            className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block"
                            style={{ backgroundColor: v.colorHex ?? '#ccc' }}
                          />
                        ))}
                    </span>
                    <span className="text-gray-500 truncate max-w-[120px]">
                      {p.variants.slice(0, 2).map(v => v.label).join(', ')}
                      {p.variants.length > 2 && ` +${p.variants.length - 2}`}
                    </span>
                  </div>
                </div>
                <span className="text-gray-400 font-mono text-[10px] flex-shrink-0 max-w-[100px] truncate">
                  {p.modelKodu}
                </span>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </div>
            ))}
            {parsed.length > 8 && (
              <p className="text-xs text-gray-400 text-center">+{parsed.length - 8} ürün daha…</p>
            )}
          </div>

          {/* Normalizasyon özeti */}
          <div className="bg-green-50 border border-green-100 rounded-xl p-3">
            <p className="text-xs font-bold text-green-700 mb-1">✓ Kombine SKU Modu</p>
            <p className="text-[11px] text-green-600 leading-relaxed">
              Her Excel satırı = 1 kombinasyon SKU (renk + beden birlikte aynı varyant).
              Renkler normalize edildi (büyük/küçük harf, sayı sonekleri giderildi).
              Toplam <strong>{totalVariants}</strong> kombine varyant oluşturulacak.
            </p>
          </div>

          <button
            onClick={startImport}
            className="w-full flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                       text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <Upload size={16} />
            {parsed.length} Ürünü İçe Aktar ({totalVariants} SKU)
          </button>
        </div>
      )}

      {/* İmport ilerlemesi */}
      {(importing || done) && results.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-navy-dark">
              {importing ? 'İçe Aktarılıyor…' : 'Tamamlandı'}
            </h2>
            {importing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 size={14} className="animate-spin text-orange" />
                {progress}%
              </div>
            )}
          </div>

          {importing && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-orange h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {done && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-green-600">{successCount}</p>
                <p className="text-xs text-gray-500 mt-1">Başarılı</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-extrabold text-red-500">{errorCount}</p>
                <p className="text-xs text-gray-500 mt-1">Hatalı</p>
              </div>
            </div>
          )}

          <div className="max-h-96 overflow-y-auto space-y-1.5">
            {results.map((r) => (
              <div key={r.modelKodu}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs
                  ${r.status === 'success' ? 'bg-green-50' : r.status === 'error' ? 'bg-red-50' : 'bg-gray-50'}`}
              >
                {r.status === 'success' && <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />}
                {r.status === 'error'   && <XCircle      size={14} className="text-red-400 flex-shrink-0" />}
                {r.status === 'pending' && <Loader2      size={14} className="text-gray-300 flex-shrink-0 animate-spin" />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-700 truncate">{r.name}</p>
                  {r.message && <p className="text-red-400 truncate">{r.message}</p>}
                </div>
                <span className="text-gray-400 font-mono flex-shrink-0">{r.modelKodu}</span>
              </div>
            ))}
          </div>

          {done && (
            <Link
              href="/admin/urunler"
              className="w-full flex items-center justify-center gap-2 bg-navy-dark hover:bg-navy
                         text-white font-bold py-3 rounded-xl transition-colors text-sm"
            >
              Ürün Listesine Git
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
