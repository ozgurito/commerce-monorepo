'use client'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { PriceRangeSlider } from './PriceRangeSlider'
import type { CategoryDto } from '@/domains/categories/categories.types'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL']
const COLORS: { label: string; hex: string }[] = [
  { label: 'Siyah',  hex: '#000000' },
  { label: 'Beyaz',  hex: '#FFFFFF' },
  { label: 'Lacivert', hex: '#1A2B5E' },
  { label: 'Kırmızı', hex: '#EF4444' },
  { label: 'Mavi',   hex: '#3B82F6' },
  { label: 'Yeşil',  hex: '#22C55E' },
  { label: 'Gri',    hex: '#9CA3AF' },
  { label: 'Bej',    hex: '#D4B896' },
]

interface Filters {
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  colors: string[]
  sizes: string[]
}

interface Props {
  filters: Filters
  onFilterChange: (patch: Partial<Filters>) => void
  onReset: () => void
  isOpen: boolean
  onClose: () => void
}

export function FilterSidebar({ filters, onFilterChange, onReset, isOpen, onClose }: Props) {
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })
  const rootCats = categories.filter((c: CategoryDto) => c.parentId === null && c.isActive)

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]

  const hasFilters =
    filters.categoryId || filters.minPrice || filters.maxPrice ||
    filters.colors.length || filters.sizes.length

  return (
    <>
      {/* Mobil overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[300] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-[310] shadow-2xl
                    transform transition-transform duration-300 lg:relative lg:shadow-none
                    lg:w-auto lg:translate-x-0 lg:z-auto lg:h-auto
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b lg:hidden">
          <span className="font-bold text-navy-dark">Filtreler</span>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-full pb-24 lg:pb-0">
          {/* Temizle butonu */}
          {hasFilters && (
            <button
              onClick={onReset}
              className="text-xs font-semibold text-orange hover:underline"
            >
              Filtreleri Temizle
            </button>
          )}

          {/* Kategori */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Kategori</p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => onFilterChange({ categoryId: undefined })}
                  className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors
                              ${!filters.categoryId ? 'bg-orange-light text-orange font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Tüm Kategoriler
                </button>
              </li>
              {rootCats.map((cat: CategoryDto) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onFilterChange({ categoryId: cat.id })}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-sm transition-colors
                                ${filters.categoryId === cat.id ? 'bg-orange-light text-orange font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Fiyat */}
          <PriceRangeSlider
            key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
            initialMin={filters.minPrice}
            initialMax={filters.maxPrice}
            onChange={(min, max) => onFilterChange({ minPrice: min, maxPrice: max })}
          />

          {/* Beden */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Beden</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => onFilterChange({ sizes: toggleArr(filters.sizes, s) })}
                  className={`min-w-[40px] h-9 px-2.5 rounded-lg border text-xs font-bold transition-colors
                              ${filters.sizes.includes(s)
                                ? 'bg-navy-dark text-white border-navy-dark'
                                : 'border-gray-200 text-gray-700 hover:border-navy-dark'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Renk */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Renk</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(({ label, hex }) => (
                <button
                  key={label}
                  onClick={() => onFilterChange({ colors: toggleArr(filters.colors, label) })}
                  title={label}
                  aria-label={label}
                  className={`w-7 h-7 rounded-full border-2 transition-all
                              ${filters.colors.includes(label)
                                ? 'border-orange scale-110'
                                : 'border-gray-200 hover:border-gray-400'}`}
                  style={{
                    backgroundColor: hex,
                    boxShadow: hex === '#FFFFFF' ? 'inset 0 0 0 1px #e5e7eb' : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
