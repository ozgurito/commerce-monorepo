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

// colorHex DB'de null olduğunda renk adına göre fallback
const COLOR_MAP: Record<string, string> = {
  'siyah': '#111111', 'beyaz': '#FFFFFF', 'lacivert': '#1A2B5E',
  'kırmızı': '#EF4444', 'mavi': '#3B82F6', 'yeşil': '#22C55E',
  'gri': '#9CA3AF', 'bej': '#D4B896', 'kahve': '#92400E',
  'kahverengi': '#7C4A2A', 'pembe': '#EC4899', 'haki': '#8B8B5A',
  'ekru': '#F5F0E1', 'sarı': '#EAB308', 'turuncu': '#F97316',
  'mor': '#A855F7', 'bordo': '#881337', 'antrasit': '#374151',
}

function resolveColorHex(hex: string | null | undefined, name: string | null | undefined): string {
  if (hex && hex !== '#cccccc') return hex
  const key = (name ?? '').toLowerCase().trim()
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
                          style={{ backgroundColor: hex }}
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
