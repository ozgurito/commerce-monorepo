import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ keyword?: string }> }
): Promise<Metadata> {
  const { keyword } = await searchParams
  return {
    title: keyword
      ? `"${keyword}" için arama sonuçları | AlışverişNoktan`
      : 'Arama | AlışverişNoktan',
  }
}

export default function AramaPage() {
  return (
    <div className="max-w-[1280px] mx-auto px-5 py-6">
      <h1 className="text-2xl font-extrabold text-navy-dark mb-6">Arama Sonuçları</h1>
      <Suspense fallback={<SkeletonGrid count={20} />}>
        <ProductsView />
      </Suspense>
    </div>
  )
}
