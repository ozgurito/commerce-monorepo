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

/* ── Trendyol sütun indexleri ───────────────────────────────────── */
const COL = {
  BARKOD:       1,
  MODEL_KODU:   3,
  RENK:         4,
  BEDEN:        5,
  CINSIYET:     7,
  KATEGORI:     9,
  URUN_ADI:     11,
  ACIKLAMA:     12,
  PIYASA_FIYAT: 13,
  SATIS_FIYAT:  14,
  STOK:         16,
  GORSEL_1:     20,
  GORSEL_2:     21,
  GORSEL_3:     22,
  GORSEL_4:     23,
  GORSEL_5:     24,
  GORSEL_6:     25,
  GORSEL_7:     26,
  GORSEL_8:     27,
  DURUM:        31,
}

interface ParsedProduct {
  modelKodu: string
  name: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  sku: string
  categoryName: string
  gender: string
  images: string[]
  sizes: string[]
  colors: { name: string }[]
  isActive: boolean
}

interface ImportResult {
  modelKodu: string
  name: string
  status: 'success' | 'error' | 'pending'
  message?: string
}

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
    const comparePrice = parseFloat(String(first[COL.PIYASA_FIYAT] ?? '0')) || undefined

    // Tüm satırların stok toplamı (ya da ilk satırın stoku)
    const totalStock = groupRows.reduce((sum, r) => {
      return sum + (parseInt(String((r as unknown[])[COL.STOK] ?? '0')) || 0)
    }, 0)

    // Görseller — ilk satırdaki dolu görsel URL'lerini al
    const images = [
      COL.GORSEL_1, COL.GORSEL_2, COL.GORSEL_3, COL.GORSEL_4,
      COL.GORSEL_5, COL.GORSEL_6, COL.GORSEL_7, COL.GORSEL_8,
    ]
      .map(idx => String(first[idx] ?? '').trim())
      .filter(url => url.startsWith('http'))

    // Unique bedenler
    const sizes = [...new Set(
      groupRows
        .map(r => String((r as unknown[])[COL.BEDEN] ?? '').trim())
        .filter(Boolean)
    )]

    // Unique renkler
    const colors = [...new Set(
      groupRows
        .map(r => String((r as unknown[])[COL.RENK] ?? '').trim())
        .filter(Boolean)
    )].map(name => ({ name }))

    products.push({
      modelKodu,
      name,
      description: String(first[COL.ACIKLAMA] ?? '').trim() || name,
      price,
      comparePrice: (comparePrice && comparePrice > price) ? comparePrice : undefined,
      stock: totalStock || 100,
      sku: String(first[COL.BARKOD] ?? modelKodu).trim(),
      categoryName: String(first[COL.KATEGORI] ?? '').trim(),
      gender: String(first[COL.CINSIYET] ?? '').trim(),
      images,
      sizes,
      colors,
      isActive: String(first[COL.DURUM] ?? '').toLowerCase().includes('aktif') || true,
    })
  })

  return products
}

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [parsed, setParsed] = useState<ParsedProduct[] | null>(null)
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [progress, setProgress] = useState(0)

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
      const wb = read(buf)
      const ws = wb.Sheets[wb.SheetNames[0]]
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
        const cat = categories.find(c =>
          c.name.toLowerCase() === p.categoryName.toLowerCase()
        )
        const categoryId = cat?.id ?? categories[0]?.id ?? 1

        // Ürün oluştur
        const product = await adminApi.createProduct({
          name: p.name,
          description: p.description.length >= 10 ? p.description : p.name + ' — detaylı açıklama ekleyin',
          price: p.price,
          comparePrice: p.comparePrice,
          stock: p.stock,
          sku: p.sku,
          categoryId,
          gender: p.gender || undefined,
          isActive: p.isActive,
        })

        // Görseller — ilkini primary yap
        for (let imgIdx = 0; imgIdx < p.images.length; imgIdx++) {
          try {
            await adminApi.addProductImage(product.id, p.images[imgIdx], imgIdx === 0)
          } catch { /* görsel hataları sessizce atla */ }
        }

        // Beden varyantları
        for (const size of p.sizes) {
          try {
            await adminApi.createVariant(product.id, {
              variantType: 'SIZE',
              name: size,
              size,
              stock: Math.floor(p.stock / Math.max(p.sizes.length, 1)),
            })
          } catch { /* devam */ }
        }

        // Renk varyantları
        for (const color of p.colors) {
          try {
            await adminApi.createVariant(product.id, {
              variantType: 'COLOR',
              name: color.name,
              color: color.name,
              stock: 0,
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
    const failCount = res.filter(r => r.status === 'error').length
    toast.success(`İçe aktarma tamamlandı: ${successCount} başarılı, ${failCount} hatalı`)
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

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
          Her satır beden/renk varyantı, <strong>Model Kodu</strong> ile gruplanır.
          Görsel URL&apos;leri, bedenler ve renkler otomatik eşlenir.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {['Ürün Adı', 'Fiyat', 'Stok', 'Kategori', 'Görseller (8 adet)', 'Bedenler', 'Renkler', 'Cinsiyet'].map(f => (
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
              <p className="text-xs text-gray-400 mt-0.5">{parsed.length} benzersiz ürün bulundu</p>
            </div>
            <button
              onClick={() => { setParsed(null); setResults([]) }}
              className="text-xs text-gray-400 hover:text-orange"
            >
              Farklı dosya seç
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-orange/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-orange">{parsed.length}</p>
              <p className="text-xs text-gray-500 mt-1">Benzersiz Ürün</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-navy-dark">
                {parsed.reduce((s, p) => s + p.sizes.length, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Beden Varyantı</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-extrabold text-navy-dark">
                {parsed.reduce((s, p) => s + p.images.length, 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Görsel URL</p>
            </div>
          </div>

          {/* İlk 5 ürün önizlemesi */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase">İlk 5 Ürün</p>
            {parsed.slice(0, 5).map((p) => (
              <div key={p.modelKodu} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-xs">
                {p.images[0] && (
                  <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-gray-400">
                    {p.price}₺ · {p.sizes.join(', ')} · {p.images.length} görsel
                  </p>
                </div>
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
              </div>
            ))}
            {parsed.length > 5 && (
              <p className="text-xs text-gray-400 text-center">+{parsed.length - 5} ürün daha…</p>
            )}
          </div>

          <button
            onClick={startImport}
            className="w-full flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                       text-white font-bold py-3 rounded-xl transition-colors text-sm"
          >
            <Upload size={16} />
            {parsed.length} Ürünü İçe Aktar
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

          {/* Progress bar */}
          {importing && (
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-orange h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Sonuç özeti */}
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

          {/* Ürün listesi */}
          <div className="max-h-96 overflow-y-auto space-y-1.5">
            {results.map((r) => (
              <div key={r.modelKodu}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs
                  ${r.status === 'success' ? 'bg-green-50' : r.status === 'error' ? 'bg-red-50' : 'bg-gray-50'}`}
              >
                {r.status === 'success' && <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />}
                {r.status === 'error' && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
                {r.status === 'pending' && <Loader2 size={14} className="text-gray-300 flex-shrink-0 animate-spin" />}
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
