'use client'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'

const SORT_OPTIONS = [
  { label: 'En Yeni',           sortBy: 'createdAt',     dir: 'DESC' },
  { label: 'Fiyat: Düşük→Yüksek', sortBy: 'price',      dir: 'ASC'  },
  { label: 'Fiyat: Yüksek→Düşük', sortBy: 'price',      dir: 'DESC' },
  { label: 'En Çok Değerlendirilen', sortBy: 'totalReviews', dir: 'DESC' },
  { label: 'En Yüksek Puan',   sortBy: 'averageRating',  dir: 'DESC' },
]

interface Props {
  total: number
  sortBy?: string
  sortDirection?: string
  onSortChange: (sortBy: string, sortDirection: string) => void
  onFilterOpen: () => void
}

export function SortBar({ total, sortBy, sortDirection, onSortChange, onFilterOpen }: Props) {
  const current = SORT_OPTIONS.find(
    (o) => o.sortBy === sortBy && o.dir === sortDirection
  ) ?? SORT_OPTIONS[0]

  return (
    <div className="flex items-center justify-between gap-3 py-3">
      {/* Sol: sonuç sayısı + filtre butonu (mobil) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onFilterOpen}
          className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-xl
                     px-3 py-2 text-sm font-semibold text-gray-700 hover:border-navy-dark transition-colors"
        >
          <SlidersHorizontal size={15} />
          Filtrele
        </button>
        <p className="text-sm text-gray-500">
          <span className="font-bold text-navy-dark">{total.toLocaleString('tr-TR')}</span> ürün
        </p>
      </div>

      {/* Sağ: sıralama */}
      <div className="relative">
        <select
          value={`${current.sortBy}|${current.dir}`}
          onChange={(e) => {
            const [sb, sd] = e.target.value.split('|')
            onSortChange(sb, sd)
          }}
          className="appearance-none border border-gray-200 rounded-xl pl-3 pr-8 py-2 text-sm
                     font-semibold text-gray-700 bg-white focus:outline-none focus:border-orange
                     cursor-pointer hover:border-gray-300 transition-colors"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.label} value={`${o.sortBy}|${o.dir}`}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      </div>
    </div>
  )
}
