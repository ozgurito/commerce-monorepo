'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Tag, Zap, Star } from 'lucide-react'
import { productsApi } from '@/domains/products/products.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import type { CategoryDto } from '@/domains/categories/categories.types'

interface Props {
  category: CategoryDto
  subCategories: CategoryDto[]
  isOpen: boolean
}

const CAT_THEMES: Record<string, { gradient: string; icon: string; promoImage?: string }> = {
  default:      { gradient: 'from-[#0d1a40] to-[#1a3a8f]',    icon: '🛍️' },
  // DB sluglar (tire yok)
  'tshirt':     { gradient: 'from-[#1a3a6b] to-[#2d5fa6]',    icon: '👕', promoImage: '/images/mega-menu/tshirt-promo.webp' },
  'hoodie':     { gradient: 'from-[#1a1040] to-[#2d1a6b]',    icon: '🧥', promoImage: '/images/mega-menu/hoodie-promo.webp' },
  'sweatshirt': { gradient: 'from-[#0a2a2a] to-[#0d4a4a]',    icon: '👔', promoImage: '/images/mega-menu/hoodie-promo.webp' }, // Aynı konsept
  'esofman':    { gradient: 'from-[#1a1a1a] to-[#4a4a4a]',    icon: '🏃', promoImage: '/images/mega-menu/esofman-promo.webp' },
  'tanktop':    { gradient: 'from-[#3d0a2a] to-[#6b1a4a]',    icon: '🎽' },
  'tank-top':   { gradient: 'from-[#3d0a2a] to-[#6b1a4a]',    icon: '🎽' },
  // Tire'li alternatifler / Türkçe
  't-shirt':    { gradient: 'from-[#1a3a6b] to-[#2d5fa6]',    icon: '👕', promoImage: '/images/mega-menu/tshirt-promo.webp' },
  'eşofman':    { gradient: 'from-[#1a1a1a] to-[#4a4a4a]',    icon: '🏃', promoImage: '/images/mega-menu/esofman-promo.webp' },
  'elbise':     { gradient: 'from-[#3d0a2a] to-[#6b1a4a]',    icon: '👗' },
  'pantolon':   { gradient: 'from-[#0d1a60] to-[#1a3a8f]',    icon: '👖' },
  'gömlek':     { gradient: 'from-[#0a2040] to-[#1a4070]',    icon: '👕' },
  'ayakkabı':   { gradient: 'from-[#3a1a00] to-[#6b3a00]',    icon: '👟' },
  'çanta':      { gradient: 'from-[#0a3a1a] to-[#1a6b3a]',    icon: '👜' },
}

function getTheme(slug: string) {
  return CAT_THEMES[slug.toLowerCase()] ?? CAT_THEMES.default
}

export function MegaMenuPanel({ category, subCategories, isOpen }: Props) {
  const theme = getTheme(category.slug)

  // Öne çıkan veya normal ürünleri getir
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: QUERY_KEYS.products.list({ categoryId: category.id, size: 8, sortBy: 'createdAt', sortDirection: 'DESC' }),
    queryFn: () => productsApi.getList({ categoryId: category.id, size: 8, sortBy: 'createdAt', sortDirection: 'DESC' }),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  })

  const productList = products?.content ?? []

  return (
    <div className="bg-white shadow-[0_12px_48px_rgba(0,0,0,.18)] border-t border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 flex gap-0 items-stretch">

        {/* ── Sol: Kategori hero banner ── */}
        <div className="w-[180px] flex-shrink-0 flex flex-col items-start justify-between p-5 relative overflow-hidden min-h-[260px]">
          {theme.promoImage || category.imageUrl ? (
            <>
              <Image
                src={theme.promoImage || category.imageUrl!}
                alt={category.name}
                fill
                sizes="180px"
                className="object-cover object-center"
              />
              {/* Hafifletilmiş overlay — görsel daha görünür */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient}`} />
          )}

          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
          <div className="absolute top-4 right-3 w-10 h-10 bg-white/10 rounded-full" />

          <div className="relative">
            <p className="text-white/80 text-[10px] font-semibold uppercase tracking-wider">
              Kategori
            </p>
            <h3 className="text-white font-extrabold text-lg leading-tight mt-0.5">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-white/70 text-xs mt-1 leading-snug line-clamp-2">
                {category.description}
              </p>
            )}
          </div>

          <Link
            href={`/kategori/${category.slug}`}
            className="relative flex items-center gap-1.5 mt-3 bg-white/20 hover:bg-white/30
                       text-white text-xs font-bold px-3 py-1.5 rounded-full
                       transition-colors whitespace-nowrap backdrop-blur-sm border border-white/20"
          >
            Tümünü Gör <ArrowRight size={11} />
          </Link>
        </div>

        {/* ── Sağ: Ürün paneli ── */}
        <div className="flex-1 py-4 px-6">
          {/* Başlık + Tümünü Gör */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em]">
              {category.name} Kategorisi
            </p>
            <Link
              href={`/kategori/${category.slug}`}
              className="text-xs font-bold text-orange hover:underline"
            >
              Tümünü Gör →
            </Link>
          </div>

          {/* Alt kategoriler (varsa) */}
          {subCategories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/kategori/${sub.slug}`}
                  className="px-3 py-1 text-[12px] font-medium text-gray-600 bg-gray-100
                             hover:bg-orange-50 hover:text-orange rounded-full transition-colors"
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )}

          {/* Ürünler */}
          <div className="border-t border-gray-100 pt-3">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3">
              Öne Çıkanlar
            </p>
            {productsLoading ? (
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-2.5 bg-gray-100 rounded animate-pulse mb-1 w-4/5" />
                      <div className="h-2.5 bg-gray-100 rounded animate-pulse w-2/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productList.length > 0 ? (
              <div className="grid grid-cols-4 gap-x-3 gap-y-2">
                {productList.map((product) => (
                  <Link
                    key={product.id}
                    href={`/urunler/${product.slug}`}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50
                               transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0
                                    border border-gray-100 group-hover:border-orange/40 transition-colors">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center
                                         bg-gradient-to-br ${theme.gradient}`}>
                          <span className="text-sm font-extrabold text-white/90">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-700 truncate leading-tight
                                     group-hover:text-orange transition-colors">
                        {product.name}
                      </p>
                      <p className="text-[11px] font-extrabold text-orange mt-0.5">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  )
}
