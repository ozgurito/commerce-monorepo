import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Search, ChevronRight, TrendingUp } from 'lucide-react'
import { ProductsView } from '@/components/product/ProductsView'
import { SkeletonGrid } from '@/components/product/SkeletonCard'

const TRENDING = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Oversize', 'Denim', 'Elbise']

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

interface Props {
  searchParams: Promise<{ keyword?: string }>
}

export default async function AramaPage({ searchParams }: Props) {
  const { keyword = '' } = await searchParams

  return (
    <div>
      {/* ── Search header ── */}
      <div className="bg-gradient-to-r from-navy-dark to-navy py-7 px-4
                      sm:px-6 lg:px-10 xl:px-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4">
          <Link href="/" className="hover:text-white transition-colors">Anasayfa</Link>
          <ChevronRight size={12} />
          <span className="text-white font-semibold">
            {keyword ? `"${keyword}" Araması` : 'Tüm Ürünler'}
          </span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Search size={20} className="text-white" />
          </div>
          <div>
            {keyword ? (
              <>
                <p className="text-white/70 text-xs mb-0.5">Arama sonuçları</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  &ldquo;{keyword}&rdquo;
                </h1>
              </>
            ) : (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                Tüm Ürünleri Ara
              </h1>
            )}
          </div>
        </div>

        {/* Trending chips — show when no keyword */}
        {!keyword && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-white/60 text-xs">
              <TrendingUp size={12} />
              <span>Popüler:</span>
            </div>
            {TRENDING.map((term) => (
              <Link
                key={term}
                href={`/arama?keyword=${encodeURIComponent(term)}`}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs
                           font-semibold rounded-full transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Products ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 lg:px-10 xl:px-14 py-6">
        <Suspense fallback={<SkeletonGrid count={20} />}>
          <ProductsView />
        </Suspense>
      </div>
    </div>
  )
}
