'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'
import { productsApi } from '@/domains/products/products.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/product/SkeletonCard'

export function NewArrivalsSection() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.products.list({ sortBy: 'createdAt', sortDirection: 'DESC', size: 8 }),
    queryFn: () => productsApi.getList({ sortBy: 'createdAt', sortDirection: 'DESC', size: 8 }),
    staleTime: 5 * 60 * 1000,
  })

  const products = data?.content ?? []

  if (!isLoading && products.length === 0) return null

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600
                            px-3 py-1.5 rounded-xl shadow-sm">
              <Sparkles size={16} className="text-white" />
              <span className="text-sm font-extrabold text-white">Yeni Gelenler</span>
            </div>
          </div>
          <Link
            href="/urunler?sortBy=createdAt&sortDir=DESC"
            className="flex items-center gap-1 text-sm font-bold text-orange
                       hover:text-orange-dark transition-colors group"
          >
            Tümünü Gör
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.slice(0, 8).map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 2} />
              ))}
        </div>
      </div>
    </section>
  )
}
