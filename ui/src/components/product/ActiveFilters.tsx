'use client'
import { X } from 'lucide-react'
import { formatPrice } from '@/utils/format'

interface Filters {
  categoryId?: number
  categoryName?: string
  minPrice?: number
  maxPrice?: number
  colors: string[]
  sizes: string[]
  keyword?: string
}

interface Props {
  filters: Filters
  onRemove: (key: string, value?: string) => void
}

export function ActiveFilters({ filters, onRemove }: Props) {
  const chips: { label: string; key: string; value?: string }[] = []

  if (filters.keyword) chips.push({ label: `"${filters.keyword}"`, key: 'keyword' })
  if (filters.categoryName) chips.push({ label: filters.categoryName, key: 'categoryId' })
  if (filters.minPrice) chips.push({ label: `Min ${formatPrice(filters.minPrice)}`, key: 'minPrice' })
  if (filters.maxPrice) chips.push({ label: `Max ${formatPrice(filters.maxPrice)}`, key: 'maxPrice' })
  filters.colors.forEach((c) => chips.push({ label: c, key: 'colors', value: c }))
  filters.sizes.forEach((s) => chips.push({ label: s, key: 'sizes', value: s }))

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map(({ label, key, value }) => (
        <button
          key={`${key}-${value ?? ''}`}
          onClick={() => onRemove(key, value)}
          className="flex items-center gap-1 bg-navy-50 text-navy-dark text-xs font-semibold
                     px-2.5 py-1 rounded-full hover:bg-orange-light hover:text-orange transition-colors"
        >
          {label}
          <X size={11} />
        </button>
      ))}
    </div>
  )
}
