import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailPanel } from '@/components/product/detail/ProductDetailPanel'
import { Breadcrumb } from '@/components/product/detail/Breadcrumb'
import { ReviewSection } from '@/components/product/detail/ReviewSection'
import { RelatedProducts } from '@/components/product/detail/RelatedProducts'
import { RecentlyViewedProducts } from '@/components/product/detail/RecentlyViewedProducts'

export const dynamic = 'force-dynamic'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`, {
      cache: 'no-store',
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
  const product = await getProduct(slug)
  if (!product) return { title: 'Ürün Bulunamadı' }

  return {
    title: `${product.name} | AlışverişNoktan`,
    description: product.shortDescription ?? product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? product.description?.slice(0, 160),
      images: product.images?.[0]?.imageUrl ? [{ url: product.images[0].imageUrl }] : [],
    },
  }
}

export default async function UrunDetayPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="max-w-[1280px] mx-auto px-5 pt-0 pb-3 sm:py-6">
      <Breadcrumb categoryId={product.categoryId} productName={product.name} />

      <ProductDetailPanel product={product} />

      {/* Yorumlar */}
      <ReviewSection
        productId={product.id}
        averageRating={product.averageRating}
        totalReviews={product.totalReviews}
      />

      {/* Benzer Ürünler */}
      <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />

      {/* Son İncelenenler */}
      <RecentlyViewedProducts currentProductId={product.id} />

      {/* ProductInfo.tsx'teki mobil sabit alt bar (fiyat + Hemen Al + Sepete Ekle) sayfanın
          gerçek sonunu (Yorumlar/Benzer Ürünler/Son İncelenenler dahil) kapatmasın diye boşluk. */}
      <div className="md:hidden" style={{ height: 'calc(4.5rem + env(safe-area-inset-bottom))' }} aria-hidden="true" />
    </div>
  )
}
