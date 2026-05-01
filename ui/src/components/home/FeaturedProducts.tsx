'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { productsApi } from '@/domains/products/products.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/product/SkeletonCard'
import { ChevronRight, Flame } from 'lucide-react'

export function FeaturedProducts() {
  const { data: featured = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.products.featured,
    queryFn: productsApi.getFeatured,
    staleTime: 5 * 60 * 1000,
  })

  if (!isLoading && featured.length === 0) return null

  return (
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-orange to-red-500
                            px-3 py-1.5 rounded-xl shadow-sm">
              <Flame size={16} className="text-white fill-white/80" />
              <span className="text-sm font-extrabold text-white">Öne Çıkan Ürünler</span>
            </div>
          </div>
          <Link
            href="/urunler"
            className="flex items-center gap-1 text-sm font-bold text-orange
                       hover:text-orange-dark transition-colors group"
          >
            Tümünü Gör
            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isLoading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)
            : featured.slice(0, 10).map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 4} />
              ))}
        </div>
      </div>
    </section>
  )
}
