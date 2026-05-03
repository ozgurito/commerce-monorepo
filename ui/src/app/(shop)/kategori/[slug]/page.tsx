import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Tag } from 'lucide-react'
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

async function getAllCategories() {
  try {
    const res = await fetch(`${API_URL}/api/categories`, { next: { revalidate: 60 } })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
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

const GRADIENT_PAIRS = [
  { from: 'from-pink-500',   to: 'to-rose-600',    light: 'bg-pink-50',   text: 'text-pink-700' },
  { from: 'from-blue-500',   to: 'to-indigo-600',  light: 'bg-blue-50',   text: 'text-blue-700' },
  { from: 'from-amber-500',  to: 'to-orange-600',  light: 'bg-amber-50',  text: 'text-amber-700' },
  { from: 'from-green-500',  to: 'to-emerald-600', light: 'bg-green-50',  text: 'text-green-700' },
  { from: 'from-purple-500', to: 'to-violet-600',  light: 'bg-purple-50', text: 'text-purple-700' },
  { from: 'from-teal-500',   to: 'to-cyan-600',    light: 'bg-teal-50',   text: 'text-teal-700' },
]

export default async function KategoriPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const [category, allCats] = await Promise.all([
    getCategory(slug),
    getAllCategories(),
  ])
  if (!category) notFound()

  const subCats = (allCats as { id: number; parentId: number | null; slug: string; name: string; isActive: boolean }[])
    .filter(c => c.parentId === category.id && c.isActive)

  const colorIdx = category.id % GRADIENT_PAIRS.length
  const colors = GRADIENT_PAIRS[colorIdx]

  return (
    <div>
      {/* ── Category Hero Banner ── */}
      <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-10 xl:px-14"
           style={{ minHeight: 200 }}>
        {/* Background: görsel varsa full-bleed, yoksa gradient */}
        {category.imageUrl ? (
          <>
            <Image
              src={category.imageUrl}
              alt={category.name}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            {/* Soldan koyu overlay — metin okunabilirliği (hafif, görsel baskın kalacak) */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-r ${colors.from} ${colors.to}`} />
        )}

        {/* Dekoratif daireler (görsel yokken) */}
        {!category.imageUrl && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -right-8 -top-8 w-48 h-48 rounded-full bg-white/8" />
            <div className="absolute right-16 bottom-4 w-28 h-28 rounded-full bg-white/5" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/70 text-xs mb-4">
            <Link href="/" className="hover:text-white transition-colors">Anasayfa</Link>
            <ChevronRight size={12} />
            <Link href="/urunler" className="hover:text-white transition-colors">Ürünler</Link>
            <ChevronRight size={12} />
            <span className="text-white font-semibold">{category.name}</span>
          </nav>

          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Tag size={16} className="text-white" />
                </div>
                <span className="text-white/80 text-xs font-semibold uppercase tracking-widest">
                  Kategori
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-white/75 text-sm mt-2 max-w-xl drop-shadow">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sub-category chips ── */}
      {subCats.length > 0 && (
        <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-10 xl:px-14 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <Link
              href={`/kategori/${category.slug}`}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold
                          ${colors.light} ${colors.text} border border-current/20`}
            >
              Tümü
            </Link>
            {subCats.map((sub) => (
              <Link
                key={sub.id}
                href={`/kategori/${sub.slug}`}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold
                           bg-gray-100 text-gray-700 hover:bg-orange hover:text-white
                           transition-colors whitespace-nowrap"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── Products ── */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 lg:px-10 xl:px-14 py-6">
        <Suspense fallback={<SkeletonGrid count={20} />}>
          <ProductsView defaultCategoryId={category.id} />
        </Suspense>
      </div>
    </div>
  )
}
