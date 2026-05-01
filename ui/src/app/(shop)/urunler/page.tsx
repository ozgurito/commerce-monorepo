import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

export const metadata: Metadata = {
  title: 'Tüm Ürünler | AlışverişNoktan',
  description: 'Binlerce ürün arasından seçim yapın. Filtreleme, sıralama ve kolay alışveriş.',
}

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const indirim = params.indirim === 'true'
  const yeni    = params.yeni === 'true'

  return (
    <div>
      {/* ── Full-bleed page hero — same pattern as category pages ── */}
      {indirim && (
        <div className="bg-gradient-to-r from-red-500 to-orange py-8 px-4
                        sm:px-6 lg:px-10 xl:px-14 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="hidden sm:flex gap-2 opacity-20 absolute right-14 top-1/2 -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`rounded-full bg-white
                ${i === 0 ? 'w-16 h-16' : i === 1 ? 'w-10 h-10 mt-4' : 'w-6 h-6 mt-8'}`} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
                Kampanya
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                İndirimli Ürünler
              </h1>
              <p className="text-white/80 text-sm mt-1">Sınırlı süreli kampanya fiyatları</p>
            </div>
          </div>
        </div>
      )}

      {yeni && !indirim && (
        <div className="bg-gradient-to-r from-navy-dark to-navy py-8 px-4
                        sm:px-6 lg:px-10 xl:px-14 relative overflow-hidden">
          <div className="hidden sm:flex gap-2 opacity-20 absolute right-14 top-1/2 -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`rounded-full bg-white
                ${i === 0 ? 'w-16 h-16' : i === 1 ? 'w-10 h-10 mt-4' : 'w-6 h-6 mt-8'}`} />
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🆕</span>
            </div>
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-1">
                Koleksiyon
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Yeni Gelenler
              </h1>
              <p className="text-white/80 text-sm mt-1">En taze koleksiyonlar burada</p>
            </div>
          </div>
        </div>
      )}

      {!indirim && !yeni && (
        <div className="max-w-[1280px] mx-auto px-5 pt-6">
          <h1 className="text-2xl font-extrabold text-navy-dark">Tüm Ürünler</h1>
        </div>
      )}

      <div className="max-w-[1280px] mx-auto px-5 py-6">
        <Suspense fallback={<SkeletonGrid count={20} />}>
          <ProductsView />
        </Suspense>
      </div>
    </div>
  )
}
