import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

export const metadata: Metadata = {
  title: 'Tüm Ürünler | AlışverişNoktan',
  description: 'Binlerce ürün arasından seçim yapın. Filtreleme, sıralama ve kolay alışveriş.',
}

export default function UrunlerPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-5 py-6">
      <h1 className="text-2xl font-extrabold text-navy-dark mb-6">Tüm Ürünler</h1>
      <Suspense fallback={<SkeletonGrid count={20} />}>
        <ProductsView />
      </Suspense>
    </div>
  )
}
