'use client'
import { useState } from 'react'
import { SlidersHorizontal, ChevronDown, LayoutGrid, List, Check } from 'lucide-react'

const SORT_OPTIONS = [
  { label: 'En Yeni',              sortBy: 'createdAt',    dir: 'DESC' },
  { label: 'En Çok Satan',         sortBy: 'totalReviews', dir: 'DESC' },
  { label: 'En Yüksek Puan',       sortBy: 'averageRating',dir: 'DESC' },
  { label: 'Fiyat: Artan',         sortBy: 'price',        dir: 'ASC'  },
  { label: 'Fiyat: Azalan',        sortBy: 'price',        dir: 'DESC' },
]

interface Props {
  total: number
  sortBy?: string
  sortDirection?: string
  onSortChange: (sortBy: string, sortDirection: string) => void
  onFilterOpen: () => void
  view?: 'grid' | 'list'
  onViewChange?: (v: 'grid' | 'list') => void
}

export function SortBar({
  total, sortBy, sortDirection, onSortChange, onFilterOpen,
  view = 'grid', onViewChange,
}: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const current = SORT_OPTIONS.find(
    (o) => o.sortBy === sortBy && o.dir === sortDirection
  ) ?? SORT_OPTIONS[0]

  return (
    <div className="mb-4">
      {/* Top row: result count + controls */}
      <div className="flex items-center justify-between gap-3 py-2.5 border-b border-gray-100">

        {/* Left: filter button (mobile) + count */}
        <div className="flex items-center gap-3">
          <button
            onClick={onFilterOpen}
            className="lg:hidden flex items-center gap-2 bg-white border border-gray-200
                       rounded-xl px-3.5 py-2 text-sm font-semibold text-gray-700
                       hover:border-orange hover:text-orange transition-colors shadow-sm"
          >
            <SlidersHorizontal size={15} />
            Filtrele
          </button>
          <p className="text-sm text-gray-500 hidden sm:block">
            <span className="font-extrabold text-navy-dark">{total.toLocaleString('tr-TR')}</span>
            {' '}ürün listeleniyor
          </p>
          <p className="text-sm font-bold text-navy-dark sm:hidden">
            {total.toLocaleString('tr-TR')} ürün
          </p>
        </div>

        {/* Right: view toggle + sort */}
        <div className="flex items-center gap-2">

          {/* View toggle */}
          {onViewChange && (
            <div className="hidden sm:flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => onViewChange('grid')}
                className={`p-2 transition-colors ${
                  view === 'grid'
                    ? 'bg-navy text-white'
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
                aria-label="Grid görünümü"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => onViewChange('list')}
                className={`p-2 transition-colors ${
                  view === 'list'
                    ? 'bg-navy text-white'
                    : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
                aria-label="Liste görünümü"
              >
                <List size={15} />
              </button>
            </div>
          )}

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl
                         px-3.5 py-2 text-sm font-semibold text-gray-700
                         hover:border-orange hover:text-orange transition-colors shadow-sm"
            >
              <span className="hidden sm:inline text-gray-400 text-xs font-normal mr-0.5">Sırala:</span>
              {current.label}
              <ChevronDown
                size={13}
                className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-2xl
                                shadow-[0_8px_40px_rgba(0,0,0,.15)] border border-gray-100
                                z-40 w-[220px] py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                  {SORT_OPTIONS.map((o) => {
                    const isActive = o.sortBy === current.sortBy && o.dir === current.dir
                    return (
                      <button
                        key={o.label}
                        onClick={() => {
                          onSortChange(o.sortBy, o.dir)
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5
                                    text-sm transition-colors text-left
                                    ${isActive
                                      ? 'text-orange font-semibold bg-orange-50'
                                      : 'text-gray-700 hover:bg-gray-50 font-normal'}`}
                      >
                        {o.label}
                        {isActive && <Check size={14} className="text-orange" />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick sort pills (desktop) */}
      <div className="hidden lg:flex items-center gap-2 py-3 flex-wrap">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
          Sırala:
        </span>
        {SORT_OPTIONS.map((o) => {
          const isActive = o.sortBy === current.sortBy && o.dir === current.dir
          return (
            <button
              key={o.label}
              onClick={() => onSortChange(o.sortBy, o.dir)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all
                          border ${isActive
                            ? 'bg-navy text-white border-navy shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-navy hover:text-navy'}`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
