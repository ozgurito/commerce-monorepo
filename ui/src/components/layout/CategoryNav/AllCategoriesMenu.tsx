'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Tag, Zap, Star } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/domains/products/products.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
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

  const COLORS = [
    'bg-pink-100 text-pink-700',
    'bg-blue-100 text-blue-700',
    'bg-amber-100 text-amber-700',
    'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700',
    'bg-red-100 text-red-700',
    'bg-yellow-100 text-yellow-700',
  ]

  // Hovered kategori için öne çıkan ürünleri getir
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: QUERY_KEYS.products.list({
      categoryId: hoveredId ?? 0,
      size: 8,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
    }),
    queryFn: () =>
      productsApi.getList({
        categoryId: hoveredId!,
        size: 8,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      }),
    staleTime: 5 * 60 * 1000,
    enabled: hoveredId !== null,
  })
  const productList = products?.content ?? []

  return (
    <div className="bg-white shadow-[0_12px_48px_rgba(0,0,0,.18)] border-t border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 flex gap-0 items-stretch">

        {/* ── Sol: Kök kategori listesi ── */}
        <div className="w-[220px] flex-shrink-0 border-r border-gray-100 py-3">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4 py-1.5">
            Tüm Kategoriler
          </p>

          <Link
            href="/urunler"
            onClick={onClose}
            className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold text-orange
                       hover:bg-orange-50 transition-colors border-b border-gray-50 mb-1"
          >
            🛍️ Tüm Ürünleri Gör →
          </Link>

          {rootCats.map((cat, i) => (
            <button
              key={cat.id}
              onMouseEnter={() => setHoveredId(cat.id)}
              onClick={() => onClose()}
              className={`w-full flex items-center gap-2.5 justify-between px-4 py-2.5 text-[13px]
                          transition-colors text-left
                          ${hoveredId === cat.id
                            ? 'bg-orange-50 text-orange font-semibold'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-navy font-normal'}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-6 h-6 rounded-lg text-[11px] flex items-center justify-center
                                  font-extrabold flex-shrink-0 ${COLORS[i % COLORS.length]}`}>
                  {cat.name.charAt(0)}
                </span>
                <span className="truncate">{cat.name}</span>
              </div>
              <ChevronRight size={13} className={hoveredId === cat.id ? 'text-orange' : 'text-gray-300'} />
            </button>
          ))}
        </div>

        {/* ── Sağ: Geniş içerik paneli ── */}
        <div className="flex-1 py-5 px-6">
          {hoveredCat && (
            <>
              {/* Başlık + tümünü gör */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">
                  {hoveredCat.name} Kategorisi
                </p>
                <Link
                  href={`/kategori/${hoveredCat.slug}`}
                  onClick={onClose}
                  className="text-xs font-bold text-orange hover:underline"
                >
                  Tümünü Gör →
                </Link>
              </div>

              {/* Alt kategoriler (varsa) */}
              {subs.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {subs.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/kategori/${sub.slug}`}
                      onClick={onClose}
                      className="px-3 py-1 text-[12px] font-medium text-gray-600 bg-gray-100
                                 hover:bg-orange-50 hover:text-orange rounded-full transition-colors"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Ürünler */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3">
                  Öne Çıkanlar
                </p>
                {productsLoading ? (
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 animate-pulse" />
                        <div className="flex-1">
                          <div className="h-2.5 bg-gray-100 rounded animate-pulse mb-1 w-4/5" />
                          <div className="h-2.5 bg-gray-100 rounded animate-pulse w-2/5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : productList.length > 0 ? (
                  <div className="grid grid-cols-4 gap-x-3 gap-y-2">
                    {productList.map((product) => (
                      <Link
                        key={product.id}
                        href={`/urunler/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50
                                   transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0
                                        border border-gray-100 group-hover:border-orange/40 transition-colors">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center
                                            bg-gradient-to-br from-[#0d1a40] to-[#1a3a8f]">
                              <span className="text-sm font-extrabold text-white/90">
                                {product.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-gray-700 truncate leading-tight
                                         group-hover:text-orange transition-colors">
                            {product.name}
                          </p>
                          <p className="text-[11px] font-extrabold text-orange mt-0.5">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
