'use client'
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { PriceRangeSlider } from './PriceRangeSlider'
import type { CategoryDto } from '@/domains/categories/categories.types'

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', '4XL', '5XL']
const COLORS: { label: string; hex: string }[] = [
  { label: 'Siyah',       hex: '#111111' },
  { label: 'Beyaz',       hex: '#FFFFFF' },
  { label: 'Lacivert',    hex: '#1A2B5E' },
  { label: 'Kırmızı',     hex: '#EF4444' },
  { label: 'Mavi',        hex: '#3B82F6' },
  { label: 'Yeşil',       hex: '#22C55E' },
  { label: 'Gri',         hex: '#9CA3AF' },
  { label: 'Bej',         hex: '#D4B896' },
  { label: 'Kahve',       hex: '#92400E' },
  { label: 'Kahverengi',  hex: '#7C4A2A' },
  { label: 'Pembe',       hex: '#EC4899' },
  { label: 'Haki',        hex: '#8B8B5A' },
  { label: 'Ekru',        hex: '#F5F0E1' },
  { label: 'Sarı',        hex: '#EAB308' },
  { label: 'Turuncu',     hex: '#F97316' },
  { label: 'Mor',         hex: '#A855F7' },
  { label: 'Bordo',       hex: '#881337' },
  { label: 'Antrasit',    hex: '#374151' },
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

function FilterSection({
  title,
  defaultOpen = true,
  children,
  count,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  count?: number
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left group"
      >
        <span className="text-[13px] font-bold text-gray-800 flex items-center gap-2">
          {title}
          {count !== undefined && count > 0 && (
            <span className="text-[10px] font-extrabold bg-orange text-white
                             rounded-full px-1.5 py-0.5 leading-none">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          size={15}
          className={`text-gray-400 transition-transform duration-200
                      group-hover:text-gray-600 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

export function FilterSidebar({ filters, onFilterChange, onReset, isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })
  const rootCats = mounted
    ? categories.filter((c: CategoryDto) => c.parentId === null && c.isActive)
    : []

  const toggleArr = (arr: string[], val: string) =>
    arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]

  const activeFilterCount =
    (filters.categoryId ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    filters.colors.length +
    filters.sizes.length

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[300] lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-[300px] bg-white z-[310] shadow-2xl
                    transform transition-transform duration-300 ease-in-out
                    lg:relative lg:shadow-none lg:w-[240px] lg:translate-x-0
                    lg:z-auto lg:h-auto lg:top-auto lg:sticky lg:self-start
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    flex flex-col`}
        style={{ top: 'calc(68px + 44px + 1rem)' }}
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 lg:hidden">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-navy-dark" />
            <span className="font-extrabold text-navy-dark text-sm">Filtreler</span>
            {activeFilterCount > 0 && (
              <span className="text-xs bg-orange text-white rounded-full px-2 py-0.5 font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
                       text-gray-500 transition-colors"
          >
            <X size={17} />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:flex items-center justify-between py-3 border-b border-gray-100 mb-1">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={15} className="text-navy-dark" />
            <span className="font-extrabold text-navy-dark text-sm">Filtreler</span>
            {activeFilterCount > 0 && (
              <span className="text-[10px] bg-orange text-white rounded-full
                               px-1.5 py-0.5 font-extrabold">
                {activeFilterCount}
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-xs font-bold text-orange hover:text-orange-dark transition-colors"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Scrollable filter content */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-0 lg:pr-1">

          {/* Kategori */}
          <FilterSection title="Kategori" count={filters.categoryId ? 1 : 0}>
            <div className="space-y-0.5">
              <button
                onClick={() => onFilterChange({ categoryId: undefined })}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors
                            ${!filters.categoryId
                              ? 'bg-orange-50 text-orange font-semibold'
                              : 'text-gray-600 hover:bg-gray-50 font-normal'}`}
              >
                Tüm Kategoriler
              </button>
              {rootCats.map((cat: CategoryDto) => (
                <button
                  key={cat.id}
                  onClick={() => onFilterChange({ categoryId: cat.id })}
                  className={`w-full text-left px-3 py-2 rounded-xl text-[13px] transition-colors truncate
                              ${filters.categoryId === cat.id
                                ? 'bg-orange-50 text-orange font-semibold'
                                : 'text-gray-600 hover:bg-gray-50 font-normal'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Fiyat */}
          <FilterSection
            title="Fiyat Aralığı"
            count={filters.minPrice || filters.maxPrice ? 1 : 0}
          >
            <PriceRangeSlider
              key={`${filters.minPrice ?? ''}-${filters.maxPrice ?? ''}`}
              initialMin={filters.minPrice}
              initialMax={filters.maxPrice}
              onChange={(min, max) => onFilterChange({ minPrice: min, maxPrice: max })}
            />
          </FilterSection>

          {/* Beden */}
          <FilterSection title="Beden" count={filters.sizes.length}>
            <div className="flex flex-wrap gap-1.5">
              {SIZES.map((s) => {
                const active = filters.sizes.includes(s)
                return (
                  <button
                    key={s}
                    onClick={() => onFilterChange({ sizes: toggleArr(filters.sizes, s) })}
                    className={`min-w-[40px] h-9 px-2 rounded-xl border text-xs font-bold
                                transition-all duration-150
                                ${active
                                  ? 'bg-navy text-white border-navy shadow-sm scale-[1.05]'
                                  : 'border-gray-200 text-gray-600 hover:border-navy hover:text-navy bg-white'}`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
          </FilterSection>

          {/* Renk */}
          <FilterSection title="Renk" count={filters.colors.length}>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-x-2 gap-y-3">
              {COLORS.map(({ label, hex }) => {
                const active = filters.colors.includes(label)
                return (
                  <button
                    key={label}
                    onClick={() => onFilterChange({ colors: toggleArr(filters.colors, label) })}
                    title={label}
                    aria-label={label}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl border-2 transition-all duration-150 flex-shrink-0
                                  ${active
                                    ? 'border-orange scale-110 shadow-md'
                                    : 'border-gray-200 hover:border-gray-400 hover:scale-105'}`}
                      style={{
                        backgroundColor: hex,
                        boxShadow: hex === '#FFFFFF'
                          ? 'inset 0 0 0 1px #e5e7eb'
                          : active ? '0 2px 8px rgba(242,122,26,0.4)' : undefined,
                      }}
                    >
                      {active && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full
                            ${hex === '#FFFFFF' ? 'bg-orange' : 'bg-white'}`} />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-medium leading-tight text-center
                                     truncate max-w-[44px] w-full
                                     ${active ? 'text-orange' : 'text-gray-500'}`}>
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </FilterSection>
        </div>

        {/* Mobile: sticky apply button */}
        <div className="lg:hidden border-t border-gray-100 px-4 py-3 bg-white">
          {activeFilterCount > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => { onReset(); onClose() }}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold
                           py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Temizle
              </button>
              <button
                onClick={onClose}
                className="flex-2 bg-orange text-white font-bold py-2.5 px-6
                           rounded-xl text-sm hover:bg-orange-dark transition-colors"
              >
                Uygula ({activeFilterCount})
              </button>
            </div>
          )}
          {activeFilterCount === 0 && (
            <button
              onClick={onClose}
              className="w-full bg-navy text-white font-bold py-2.5 rounded-xl text-sm"
            >
              Kapat
            </button>
          )}
        </div>
      </aside>
    </>
  )
}
