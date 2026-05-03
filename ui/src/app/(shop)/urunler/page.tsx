import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

export const metadata: Metadata = {
  title: 'Tüm Ürünler | AlışverişNoktan',
  description: 'Binlerce ürün arasından seçim yapın. Filtreleme, sıralama ve kolay alışveriş.',
}

/* ── Tekrar eden hero bileşeni — görsel destekli ───────────────── */
function PageHero({
  image, overlay, fallbackGradient, icon, tag, title, subtitle,
}: {
  image?: string
  overlay?: string
  fallbackGradient: string
  icon: string
  tag: string
  title: string
  subtitle: string
}) {
  return (
    <div className="relative overflow-hidden py-10 px-4 sm:px-6 lg:px-10 xl:px-14"
         style={{ minHeight: 160 }}>
      {/* Arka plan: görsel varsa full-bleed, yoksa gradient */}
      {image ? (
        <>
          <Image src={image} alt={title} fill sizes="100vw"
                 className="object-cover object-center" priority />
          <div className={`absolute inset-0 ${overlay ?? 'bg-gradient-to-r from-black/80 via-black/50 to-transparent'}`} />
        </>
      ) : (
        <div className={`absolute inset-0 ${fallbackGradient}`} />
      )}

      {/* İçerik */}
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-white/75 text-xs font-bold uppercase tracking-widest mb-1">{tag}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">{title}</h1>
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params   = await searchParams
  const indirim  = params.indirim  === 'true'
  const yeni     = params.yeni     === 'true'
  const sortBy   = params.sortBy   as string | undefined
  const minPrice = params.minPrice as string | undefined

  const cokSatan    = sortBy === 'totalReviews'
  const yuksekPuan  = sortBy === 'averageRating'
  const kargoBedava = minPrice === '150' && !indirim && !yeni

  const hasHero = indirim || yeni || cokSatan || yuksekPuan || kargoBedava

  return (
    <div>
      {indirim && (
        <PageHero
          image="/images/Gemini_Generated_Image_wqe2m0wqe2m0wqe2.png"
          overlay="bg-gradient-to-r from-red-900/85 via-red-800/55 to-red-900/10"
          fallbackGradient="bg-gradient-to-r from-red-500 to-orange"
          icon="⚡" tag="Kampanya" title="İndirimli Ürünler"
          subtitle="Sınırlı süreli kampanya fiyatları" />
      )}
      {yeni && !indirim && (
        <PageHero
          image="/images/Gemini_Generated_Image_cn8r3pcn8r3pcn8r.png"
          overlay="bg-gradient-to-r from-[#0d1a40]/85 via-[#0d1a40]/50 to-[#0d1a40]/10"
          fallbackGradient="bg-gradient-to-r from-navy-dark to-navy"
          icon="✨" tag="Koleksiyon" title="Yeni Gelenler"
          subtitle="En taze koleksiyonlar burada" />
      )}
      {cokSatan && (
        <PageHero
          image="/images/Gemini_Generated_Image_qlnnl6qlnnl6qlnn.png"
          overlay="bg-gradient-to-r from-amber-900/85 via-amber-800/50 to-amber-900/10"
          fallbackGradient="bg-gradient-to-r from-amber-500 to-orange-500"
          icon="🔥" tag="Popüler" title="En Çok Satanlar"
          subtitle="Müşterilerimizin en çok tercih ettiği ürünler" />
      )}
      {yuksekPuan && (
        <PageHero
          image="/images/Gemini_Generated_Image_mvxrihmvxrihmvxr.png"
          overlay="bg-gradient-to-r from-violet-900/85 via-violet-800/50 to-violet-900/10"
          fallbackGradient="bg-gradient-to-r from-violet-500 to-purple-600"
          icon="⭐" tag="Kalite" title="Yüksek Puanlı Ürünler"
          subtitle="4 yıldız ve üzeri değerlendirilen ürünler" />
      )}
      {kargoBedava && (
        <PageHero
          image="/images/Gemini_Generated_Image_e4ocsfe4ocsfe4oc.png"
          overlay="bg-gradient-to-r from-emerald-900/85 via-emerald-800/50 to-emerald-900/10"
          fallbackGradient="bg-gradient-to-r from-emerald-500 to-teal-600"
          icon="📦" tag="Fırsat" title="Kargo Bedava Ürünler"
          subtitle="Seçili ürünlerde ücretsiz kargo fırsatı" />
      )}
      {!hasHero && (
        <PageHero
          image="/images/Gemini_Generated_Image_9n6f7z9n6f7z9n6f.png"
          overlay="bg-gradient-to-r from-[#0d1a40]/85 via-[#0d1a40]/50 to-[#0d1a40]/10"
          fallbackGradient="bg-gradient-to-r from-navy-dark to-navy"
          icon="🛍️" tag="Koleksiyon" title="Tüm Ürünler"
          subtitle="Binlerce ürün arasından seçim yapın" />
      )}

      <div className="max-w-[1280px] mx-auto px-5 py-6">
        <Suspense fallback={<SkeletonGrid count={20} />}>
          <ProductsView />
        </Suspense>
      </div>
    </div>
  )
}
