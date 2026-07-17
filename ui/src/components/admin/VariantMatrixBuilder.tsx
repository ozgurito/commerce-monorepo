'use client'
import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { adminApi } from '@/domains/admin/admin.api'
import { CANONICAL_COLORS, COLOR_HEX_MAP, SIZES } from '@/domains/products/colors'

interface Props {
  productId: number
  onGenerated: () => void
}

const inputCls = () =>
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20 transition-colors'

export function VariantMatrixBuilder({ productId, onGenerated }: Props) {
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [customColorName, setCustomColorName] = useState('')
  const [customColorHex, setCustomColorHex] = useState('#000000')
  const [customHexByColor, setCustomHexByColor] = useState<Record<string, string>>({})
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkStock, setBulkStock] = useState(100)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const toggleColor = (color: string) => {
    setSelectedColors((cur) => cur.includes(color) ? cur.filter((c) => c !== color) : [...cur, color])
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((cur) => cur.includes(size) ? cur.filter((s) => s !== size) : [...cur, size])
  }

  const addCustomColor = () => {
    const name = customColorName.trim()
    if (!name) return
    if (!selectedColors.includes(name)) {
      setSelectedColors((cur) => [...cur, name])
      setCustomHexByColor((cur) => ({ ...cur, [name]: customColorHex }))
    }
    setCustomColorName('')
    setCustomColorHex('#000000')
  }

  const colorHexFor = (color: string) => COLOR_HEX_MAP[color] ?? customHexByColor[color] ?? '#9ca3af'

  const canGenerate = (selectedColors.length > 0 || selectedSizes.length > 0) && !generating

  const handleGenerate = async () => {
    const colors = selectedColors.length ? selectedColors : [undefined]
    const sizes = selectedSizes.length ? selectedSizes : [undefined]
    const combos = colors.flatMap((c) => sizes.map((s) => ({ color: c, size: s })))
    if (!combos.length) return

    setGenerating(true)
    setProgress({ done: 0, total: combos.length })
    let created = 0
    let failed = 0

    for (const combo of combos) {
      try {
        await adminApi.createVariant(productId, {
          variantType: 'COMBINED',
          name: [combo.color, combo.size].filter(Boolean).join(' - ') || 'Varsayılan',
          color: combo.color,
          colorHex: combo.color ? colorHexFor(combo.color) : undefined,
          size: combo.size,
          priceModifier: bulkPrice.trim() ? Number(bulkPrice) : undefined,
          stock: bulkStock,
        })
        created++
      } catch {
        failed++
      }
      setProgress({ done: created + failed, total: combos.length })
    }

    setGenerating(false)
    setProgress(null)
    if (created > 0) {
      setSelectedColors([])
      setSelectedSizes([])
      setCustomHexByColor({})
      setBulkPrice('')
      setBulkStock(100)
      onGenerated()
    }
  }

  return (
    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-4">
      <h3 className="text-xs font-bold text-gray-700">Renk × Beden Matrisi</h3>

      {/* Renkler */}
      <div>
        <label className="block text-[10px] font-bold text-gray-500 mb-1.5">Renkler</label>
        <div className="flex flex-wrap gap-1.5">
          {CANONICAL_COLORS.map((color) => {
            const active = selectedColors.includes(color)
            return (
              <button
                key={color}
                type="button"
                onClick={() => toggleColor(color)}
                className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-medium transition-colors
                            ${active ? 'border-orange bg-orange/10 text-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                <span className="w-3.5 h-3.5 rounded-full border border-gray-300" style={{ backgroundColor: COLOR_HEX_MAP[color] }} />
                {color}
              </button>
            )
          })}
        </div>

        {/* Özel renk ekle */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="color"
            value={customColorHex}
            onChange={(e) => setCustomColorHex(e.target.value)}
            className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            placeholder="Özel renk adı (opsiyonel)"
            value={customColorName}
            onChange={(e) => setCustomColorName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomColor() } }}
            className={inputCls() + ' max-w-[220px]'}
          />
          <button
            type="button"
            onClick={addCustomColor}
            disabled={!customColorName.trim()}
            className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200
                       rounded-xl px-3 py-2 hover:border-orange hover:text-orange transition-colors disabled:opacity-40"
          >
            <Plus size={13} /> Renk Ekle
          </button>
        </div>
      </div>

      {/* Bedenler */}
      <div>
        <label className="block text-[10px] font-bold text-gray-500 mb-1.5">Bedenler</label>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => {
            const active = selectedSizes.includes(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 rounded-full border text-xs font-bold transition-colors
                            ${active ? 'border-orange bg-orange/10 text-orange' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {size}
              </button>
            )
          })}
        </div>
      </div>

      {/* Toplu fiyat/stok */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-1">Fiyat Farkı (₺) — tümüne uygula</label>
          <input type="number" step="0.01" placeholder="0" value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)} className={inputCls()} />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-gray-500 mb-1">Stok — tümüne uygula</label>
          <input type="number" min={0} value={bulkStock}
            onChange={(e) => setBulkStock(parseInt(e.target.value) || 0)} className={inputCls()} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-gray-400">
          {selectedColors.length > 0 && selectedSizes.length > 0
            ? <>Bu seçimle <span className="font-bold text-navy-dark">{selectedColors.length * selectedSizes.length}</span> varyant oluşturulacak</>
            : selectedColors.length > 0 || selectedSizes.length > 0
              ? <>Bu seçimle <span className="font-bold text-navy-dark">{Math.max(selectedColors.length, selectedSizes.length)}</span> varyant oluşturulacak</>
              : 'Renk ve/veya beden seçin'}
        </p>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="flex items-center gap-1.5 bg-navy-dark hover:bg-navy text-white font-bold
                     rounded-xl text-xs px-4 py-2.5 transition-colors disabled:opacity-40"
        >
          {generating
            ? <><Loader2 size={14} className="animate-spin" /> Oluşturuluyor {progress ? `${progress.done}/${progress.total}` : ''}</>
            : <><Plus size={14} /> Varyantları Oluştur</>}
        </button>
      </div>
    </div>
  )
}
