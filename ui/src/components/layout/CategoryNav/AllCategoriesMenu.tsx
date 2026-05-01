'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { CategoryDto } from '@/domains/categories/categories.types'

interface Props {
  rootCats: CategoryDto[]
  subMap: Record<number, CategoryDto[]>
  onClose: () => void
}

export function AllCategoriesMenu({ rootCats, subMap, onClose }: Props) {
  const [hoveredId, setHoveredId] = useState<number | null>(
    rootCats.length > 0 ? rootCats[0].id : null
  )

  const hoveredCat = rootCats.find(c => c.id === hoveredId)
  const subs = hoveredId ? (subMap[hoveredId] ?? []) : []

  return (
    <div className="bg-white shadow-[0_8px_40px_rgba(0,0,0,.15)] border-t border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 flex" style={{ minHeight: 320 }}>

        {/* Left: root categories list */}
        <div className="w-[220px] flex-shrink-0 border-r border-gray-100 py-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]
                        px-4 py-1.5">
            Tüm Kategoriler
          </p>

          {/* "All products" shortcut */}
          <Link
            href="/urunler"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-orange
                       hover:bg-orange-50 transition-colors border-b border-gray-50 mb-1"
          >
            Tüm Ürünleri Gör →
          </Link>

          {rootCats.map((cat) => (
            <button
              key={cat.id}
              onMouseEnter={() => setHoveredId(cat.id)}
              onClick={() => onClose()}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px]
                          transition-colors text-left rounded-r-xl
                          ${hoveredId === cat.id
                            ? 'bg-orange-50 text-orange font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-navy font-normal'}`}
            >
              <span>{cat.name}</span>
              {(subMap[cat.id]?.length ?? 0) > 0 && (
                <ChevronRight
                  size={13}
                  className={hoveredId === cat.id ? 'text-orange' : 'text-gray-300'}
                />
              )}
            </button>
          ))}
        </div>

        {/* Right: subcategories */}
        <div className="flex-1 py-5 px-6">
          {hoveredCat && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">
                  {hoveredCat.name}
                </p>
                <Link
                  href={`/kategori/${hoveredCat.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-orange hover:underline"
                >
                  Tümünü Gör →
                </Link>
              </div>

              {subs.length > 0 ? (
                <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/kategori/${sub.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-600
                                 hover:bg-orange-50 hover:text-orange rounded-xl transition-colors
                                 font-medium group"
                    >
                      <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-orange
                                       flex-shrink-0 transition-colors" />
                      {sub.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  href={`/kategori/${hoveredCat.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 bg-orange text-white
                             rounded-xl text-sm font-bold hover:bg-orange-dark transition-colors"
                >
                  {hoveredCat.name} Kategorisine Git →
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
