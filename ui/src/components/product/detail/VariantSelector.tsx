'use client'
import { useRef } from 'react'
import type { ProductVariantDto } from '@/domains/products/products.types'

interface Props {
  variants: ProductVariantDto[]
  /** Grup adı → seçili varyant (null = seçilmedi) */
  selections: Record<string, ProductVariantDto | null>
  onSelect: (groupName: string, variant: ProductVariantDto) => void
  /** Hangi gruplar zorunlu ama henüz seçilmedi */
  errorGroups?: string[]
}

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']

// colorHex DB'de null olduğunda renk adına göre fallback (Turkish-aware)
const COLOR_MAP: Record<string, string> = {
  // Temel renkler
  'siyah':           '#1a1a1a',
  'beyaz':           '#FFFFFF',
  'gri':             '#9ca3af',
  'mavi':            '#3b82f6',
  'kırmızı':         '#ef4444',
  'kirmizi':         '#ef4444',
  'mor':             '#8b5cf6',
  'pembe':           '#f472b6',
  'yeşil':           '#22c55e',
  'yesil':           '#22c55e',
  'lacivert':        '#1e3a5f',
  'kahverengi':      '#92400e',
  'kahve':           '#92400e',
  'bej':             '#d4b896',
  'bordo':           '#7f1d1d',
  'sarı':            '#facc15',
  'sari':            '#facc15',
  'ekru':            '#f5f0e8',
  'haki':            '#78716c',
  'turuncu':         '#f97316',
  'antrasit':        '#374151',
  // Özel tonlar
  'koyu yeşil':      '#14532d',
  'koyu yesil':      '#14532d',
  'saks mavisi':     '#4682b4',
  'saks mavi':       '#4682b4',
  'bebe mavisi':     '#a8d8ea',
  'bebe mavi':       '#a8d8ea',
  'indigo mavi':     '#4f46e5',
  'i̇ndigo mavi':    '#4f46e5',
  'çok renkli':      '#ff6b6b',
  'cok renkli':      '#ff6b6b',
  // Kombinler
  'siyah-beyaz':     '#555555',
  'beyaz-siyah':     '#555555',
  'kırmızı-siyah':   '#7f1d1d',
  'lacivert-siyah':  '#1e3a5f',
  'sarı-siyah':      '#854d0e',
}

// Açık renk tespiti — bu renkler için koyu kenarlık kullan
function isLightHex(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return (r * 299 + g * 587 + b * 114) / 1000 > 200
}

function resolveColorHex(hex: string | null | undefined, name: string | null | undefined): string {
  if (hex && hex !== '#cccccc') return hex
  const key = (name ?? '')
    .replace(/İ/g, 'i').replace(/I/g, 'ı')
    .toLowerCase().trim()
  return COLOR_MAP[key] ?? '#cccccc'
}

function groupVariants(variants: ProductVariantDto[] | null | undefined) {
  const groups: Record<string, ProductVariantDto[]> = {}
  if (!variants) return groups
  for (const v of variants) {
    // Hem size hem color varsa iki gruba da ekle (nadir ama olabilir)
    const key = v.size ? 'Beden' : v.color ? 'Renk' : (v.variantType ?? 'Seçenek')
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  }
  // Beden grubunu standar sırayla sırala
  if (groups['Beden']) {
    groups['Beden'] = groups['Beden'].sort(
      (a, b) => SIZE_ORDER.indexOf(a.size ?? '') - SIZE_ORDER.indexOf(b.size ?? '')
    )
  }
  return groups
}

export function VariantSelector({ variants, selections, onSelect, errorGroups = [] }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const safeVariants = variants ?? []
  const groups = groupVariants(safeVariants)

  if (safeVariants.length === 0) return null

  return (
    <div ref={ref} className="space-y-4">
      {Object.entries(groups).map(([groupName, items]) => {
        const selectedInGroup = selections[groupName] ?? null
        const hasGroupError = errorGroups.includes(groupName)

        return (
          <div key={groupName}>
            <div className="flex items-center gap-2 mb-2.5">
              <p className={`text-sm font-bold ${hasGroupError ? 'text-red-500' : 'text-gray-700'}`}>
                {groupName}
                {hasGroupError && <span className="ml-1 text-red-500">*</span>}
              </p>
              {selectedInGroup && (
                <span className="text-sm text-gray-500 font-medium">
                  — {selectedInGroup.size ?? selectedInGroup.color ?? selectedInGroup.name}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {items.map((v) => {
                const isSelected = selectedInGroup?.id === v.id
                const isColorGroup = groupName === 'Renk'
                // Stok varyant seviyesinde takip edilmiyor — sadece isActive: false ise disabled
                // (Beden tükendiyse admin manuel olarak o bedeni pasife alır)
                const isDisabled = !v.isActive

                /* ── Renk grubu → dairesel swatch ── */
                if (isColorGroup) {
                  const hex = resolveColorHex(v.colorHex, v.color)
                  const light = isLightHex(hex)
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => !isDisabled && onSelect(groupName, v)}
                      disabled={isDisabled}
                      title={v.color ?? v.name}
                      className={`relative flex flex-col items-center gap-1 group/swatch
                                  ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {/* Dış halka — seçili olunca turuncu */}
                      <span
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                                    ${isSelected
                                      ? 'ring-2 ring-offset-2 ring-orange scale-110'
                                      : 'ring-1 ring-offset-1 ring-gray-300 group-hover/swatch:ring-gray-400'}
                                    ${isDisabled ? 'opacity-40' : ''}`}
                      >
                        <span
                          className="w-8 h-8 rounded-full block"
                          style={{
                            backgroundColor: hex,
                            // Açık renkler (beyaz, ekru, bebe mavisi vb.) için görünür kenarlık
                            border: light ? '1.5px solid #d1d5db' : 'none',
                          }}
                        />
                        {/* Çapraz çizgi — sadece gerçekten pasif ise */}
                        {isDisabled && (
                          <span className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                            <span className="w-full h-px bg-gray-500/70 rotate-45 block" />
                          </span>
                        )}
                      </span>
                      {/* Renk adı */}
                      <span
                        className={`text-[10px] font-semibold leading-none
                                    ${isSelected ? 'text-orange' : 'text-gray-500'}`}
                      >
                        {v.color ?? v.name}
                      </span>
                    </button>
                  )
                }

                /* ── Beden / diğer → chip ── */
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => !isDisabled && onSelect(groupName, v)}
                    disabled={isDisabled}
                    title={isDisabled ? 'Tükendi' : undefined}
                    className={`min-w-[48px] h-10 px-3 rounded-xl border-2 text-sm font-bold
                                transition-all relative
                                ${isSelected
                                  ? 'border-navy-dark bg-navy-dark text-white shadow-sm'
                                  : hasGroupError && !isDisabled
                                    ? 'border-red-300 text-gray-700 hover:border-navy-dark hover:text-navy-dark'
                                    : 'border-gray-200 text-gray-700 hover:border-navy-dark hover:text-navy-dark'}
                                ${isDisabled
                                  ? 'opacity-40 cursor-not-allowed line-through'
                                  : 'cursor-pointer'}`}
                  >
                    {v.size ?? v.color ?? v.name}
                    {/* Stok çok azsa küçük nokta */}
                    {!isDisabled && v.stock > 0 && v.stock <= 3 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full
                                        border border-white" />
                    )}
                  </button>
                )
              })}
            </div>

            {hasGroupError && (
              <p className="text-xs text-red-500 font-semibold mt-1.5 animate-pulse">
                Lütfen bir {groupName.toLowerCase()} seçin
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { type Props as VariantSelectorProps }
export { groupVariants }
