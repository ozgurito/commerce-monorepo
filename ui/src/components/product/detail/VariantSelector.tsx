'use client'
import { useRef } from 'react'
import type { ProductVariantDto } from '@/domains/products/products.types'

interface Props {
  variants: ProductVariantDto[]
  selected: ProductVariantDto | null
  onSelect: (variant: ProductVariantDto) => void
  hasError: boolean
}

function groupVariants(variants: ProductVariantDto[]) {
  const groups: Record<string, ProductVariantDto[]> = {}
  for (const v of variants) {
    const key = v.size ? 'Beden' : v.color ? 'Renk' : (v.variantType ?? 'Seçenek')
    if (!groups[key]) groups[key] = []
    groups[key].push(v)
  }
  return groups
}

export function VariantSelector({ variants, selected, onSelect, hasError }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const groups = groupVariants(variants)

  if (variants.length === 0) return null

  return (
    <div ref={ref} className="space-y-4">
      {Object.entries(groups).map(([groupName, items]) => (
        <div key={groupName}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm font-bold text-gray-700">{groupName}</p>
            {selected && (
              <span className="text-sm text-gray-500">
                — {selected.size ?? selected.color ?? selected.name}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {items.map((v) => {
              const isSelected = selected?.id === v.id
              const isDisabled = !v.isActive || v.stock === 0

              if (groupName === 'Renk' && v.colorHex) {
                return (
                  <button
                    key={v.id}
                    onClick={() => !isDisabled && onSelect(v)}
                    disabled={isDisabled}
                    title={v.color ?? v.name}
                    className={`w-8 h-8 rounded-full border-2 transition-all relative
                                ${isSelected ? 'border-orange scale-110' : 'border-gray-300'}
                                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}
                    style={{ backgroundColor: v.colorHex }}
                  >
                    {isDisabled && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-px bg-gray-400 rotate-45 block" />
                      </span>
                    )}
                  </button>
                )
              }

              return (
                <button
                  key={v.id}
                  onClick={() => !isDisabled && onSelect(v)}
                  disabled={isDisabled}
                  className={`min-w-[48px] h-10 px-3 rounded-xl border-2 text-sm font-bold
                              transition-all relative
                              ${isSelected
                                ? 'border-navy-dark bg-navy-dark text-white'
                                : 'border-gray-200 text-gray-700 hover:border-navy-dark'}
                              ${isDisabled ? 'opacity-40 cursor-not-allowed line-through' : 'cursor-pointer'}`}
                >
                  {v.size ?? v.color ?? v.name}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {hasError && (
        <p className="text-sm text-red-500 font-medium animate-shake">
          Lütfen bir seçenek seçin
        </p>
      )}
    </div>
  )
}

export { type Props as VariantSelectorProps }
