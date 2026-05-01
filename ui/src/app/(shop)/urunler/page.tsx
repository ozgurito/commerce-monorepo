import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

export const metadata: Metadata = {
  title: 'Tüm Ürünler | AlışverişNoktan',
  description: 'Binlerce ürün arasından seçim yapın. Filtreleme, sıralama ve kolay alışveriş.',
}

/* ── Tekrar eden hero bileşeni ─────────────────────────────────── */
function PageHero({
  gradient, icon, tag, title, subtitle,
}: {
  gradient: string
  icon: string
  tag: string
  title: string
  subtitle: string
}) {
  return (
    <div className={`${gradient} py-8 px-4 sm:px-6 lg:px-10 xl:px-14 relative overflow-hidden`}>
      {/* Dekoratif daireler */}
      <div className="hidden sm:flex gap-2 opacity-20 absolute right-14 top-1/2 -translate-y-1/2 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`rounded-full bg-white
            ${i === 0 ? 'w-16 h-16' : i === 1 ? 'w-10 h-10 mt-4' : 'w-6 h-6 mt-8'}`} />
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">{tag}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">{title}</h1>
          <p className="text-white/80 text-sm mt-1">{subtitle}</p>
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
      {indirim  && <PageHero gradient="bg-gradient-to-r from-red-500 to-orange"
                              icon="⚡" tag="Kampanya"   title="İndirimli Ürünler"
                              subtitle="Sınırlı süreli kampanya fiyatları" />}
      {yeni && !indirim && <PageHero gradient="bg-gradient-to-r from-navy-dark to-navy"
                              icon="🆕" tag="Koleksiyon" title="Yeni Gelenler"
                              subtitle="En taze koleksiyonlar burada" />}
      {cokSatan && <PageHero gradient="bg-gradient-to-r from-amber-500 to-orange-500"
                              icon="🔥" tag="Popüler"    title="En Çok Satanlar"
                              subtitle="Müşterilerimizin en çok tercih ettiği ürünler" />}
      {yuksekPuan && <PageHero gradient="bg-gradient-to-r from-violet-500 to-purple-600"
                              icon="⭐" tag="Kalite"     title="Yüksek Puanlı Ürünler"
                              subtitle="4 yıldız ve üzeri değerlendirilen ürünler" />}
      {kargoBedava && <PageHero gradient="bg-gradient-to-r from-emerald-500 to-teal-600"
                              icon="📦" tag="Fırsat"     title="Kargo Bedava Ürünler"
                              subtitle="Seçili ürünlerde ücretsiz kargo fırsatı" />}

      {!hasHero && (
        <PageHero gradient="bg-gradient-to-r from-navy-dark to-navy"
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
