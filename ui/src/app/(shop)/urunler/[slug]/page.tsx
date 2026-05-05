import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/detail/ProductGallery'
import { ProductInfo } from '@/components/product/detail/ProductInfo'
import { Breadcrumb } from '@/components/product/detail/Breadcrumb'
import { ReviewSection } from '@/components/product/detail/ReviewSection'
import { RelatedProducts } from '@/components/product/detail/RelatedProducts'
import { RecentlyViewedProducts } from '@/components/product/detail/RecentlyViewedProducts'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_URL}/api/products/slug/${slug}`, {
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
    <div className="max-w-[1280px] mx-auto px-5 py-6">
      <Breadcrumb categoryId={product.categoryId} productName={product.name} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-start">
        {/* Sol: Galeri — sticky kalır, ProductInfo kaydıkça üstte tutunur */}
        <div className="lg:sticky lg:top-[130px] self-start">
          <ProductGallery
            images={product.images ?? []}
            productName={product.name}
            fallbackUrl={product.imageUrl ?? product.images?.[0]?.imageUrl}
          />
        </div>

        {/* Sağ: Bilgi + Sepet */}
        <ProductInfo product={product} />
      </div>

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
    </div>
  )
}
