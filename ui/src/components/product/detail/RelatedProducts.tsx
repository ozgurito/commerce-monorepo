'use client'
import { useQuery } from '@tanstack/react-query'
import { Layers } from 'lucide-react'
import { productsApi } from '@/domains/products/products.api'
import { ProductCard } from '@/components/product/ProductCard'
import { SkeletonCard } from '@/components/product/SkeletonCard'

interface Props {
  categoryId: number
  currentProductId: number
}

export function RelatedProducts({ categoryId, currentProductId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['related-products', categoryId, currentProductId],
    queryFn: () => productsApi.getList({ categoryId, size: 7, page: 0 }),
    staleTime: 5 * 60 * 1000,
  })

  const products = (data?.content ?? []).filter((p) => p.id !== currentProductId).slice(0, 6)

  if (!isLoading && products.length === 0) return null

  return (
    <section className="mt-14">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex items-center gap-1.5 bg-navy-dark px-3 py-1.5 rounded-xl">
          <Layers size={15} className="text-white" />
          <span className="text-sm font-extrabold text-white">Benzer Ürünler</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>
    </section>
  )
}
