import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductGallery } from '@/components/product/detail/ProductGallery'
import { ProductInfo } from '@/components/product/detail/ProductInfo'
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
    <div className="max-w-[1280px] mx-auto px-5 py-6">
      <Breadcrumb categoryId={product.categoryId} productName={product.name} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:items-start">

        {/* Sol: Galeri + Açıklama + Detaylar */}
        <div className="space-y-6">
          <ProductGallery
            images={product.images ?? []}
            productName={product.name}
            fallbackUrl={product.imageUrl ?? product.images?.[0]?.imageUrl}
          />

          {/* Ürün Açıklaması — galeri altında */}
          {product.description && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-base font-extrabold text-gray-800 mb-3">Ürün Açıklaması</h3>
              {product.description.includes(';') ? (
                <ul className="space-y-2">
                  {product.description
                    .split(/[;]+/)
                    .map((s: string) => s.replace(/^[\s.]+|[\s.]+$/g, ''))
                    .filter((s: string) => s.length > 4)
                    .slice(0, 10)
                    .map((sentence: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange flex-shrink-0 mt-1.5" />
                        {sentence}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              )}
            </div>
          )}

          {/* Ürün Detayları — teknik grid */}
          {(product.material || product.fabricComposition || product.careInstructions ||
            product.fitType  || product.gender            || product.season           ||
            product.originCountry) && (
            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-base font-extrabold text-gray-800 mb-3">Ürün Detayları</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'Materyal',       val: product.material },
                  { key: 'Gramaj/İçerik', val: product.fabricComposition },
                  { key: 'Yıkama',        val: product.careInstructions },
                  { key: 'Kesim',         val: product.fitType },
                  { key: 'Cinsiyet',      val: product.gender },
                  { key: 'Sezon',         val: product.season },
                  { key: 'Menşei',        val: product.originCountry },
                ].filter(x => x.val).map(({ key, val }) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-2.5">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{key}</p>
                    <p className="text-sm text-gray-800 font-semibold mt-0.5">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Bilgi + Sepet (sticky) */}
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
