import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function getCategory(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/categories/slug/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) return { title: 'Kategori Bulunamadı' }
  return {
    title: `${category.name} | AlışverişNoktan`,
    description: category.description ?? `${category.name} kategorisindeki tüm ürünler`,
  }
}

export default async function KategoriPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const category = await getCategory(slug)
  if (!category) notFound()

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-6">
      <h1 className="text-2xl font-extrabold text-navy-dark mb-6">{category.name}</h1>
      {category.description && (
        <p className="text-gray-500 text-sm mb-6 -mt-3">{category.description}</p>
      )}
      {/* ProductsView URL'deki categoryId param'ını okur — sayfaya girerken URL'e ekle */}
      <Suspense fallback={<SkeletonGrid count={20} />}>
        <ProductsView defaultCategoryId={category.id} />
      </Suspense>
    </div>
  )
}
