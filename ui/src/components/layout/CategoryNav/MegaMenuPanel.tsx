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

const CAT_THEMES: Record<string, { gradient: string; icon: string }> = {
  default:      { gradient: 'from-[#0d1a40] to-[#1a3a8f]',    icon: '🛍️' },
  // DB sluglar (tire yok)
  'tshirt':     { gradient: 'from-[#1a3a6b] to-[#2d5fa6]',    icon: '👕' },
  'hoodie':     { gradient: 'from-[#1a1040] to-[#2d1a6b]',    icon: '🧥' },
  'sweatshirt': { gradient: 'from-[#0a2a2a] to-[#0d4a4a]',    icon: '👔' },
  'tanktop':    { gradient: 'from-[#3d0a2a] to-[#6b1a4a]',    icon: '🎽' },
  'tank-top':   { gradient: 'from-[#3d0a2a] to-[#6b1a4a]',    icon: '🎽' },
  // Tire'li alternatifler
  't-shirt':    { gradient: 'from-[#1a3a6b] to-[#2d5fa6]',    icon: '👕' },
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
  const { data: products } = useQuery({
    queryKey: QUERY_KEYS.products.list({ categoryId: category.id, size: 4 }),
    queryFn: () => productsApi.getList({ categoryId: category.id, size: 4 }),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  })

  const productList = products?.content ?? []

  return (
    <div className="bg-white shadow-[0_12px_48px_rgba(0,0,0,.18)] border-t border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 flex gap-0"
           style={{ minHeight: 280 }}>

        {/* ── Sol: Kategori hero banner ── */}
        <div className="w-[180px] flex-shrink-0 flex flex-col items-start justify-between p-5 relative overflow-hidden">
          {/* Background: gerçek görsel varsa full-bleed, yoksa gradient */}
          {category.imageUrl ? (
            <>
              <Image
                src={category.imageUrl}
                alt={category.name}
                fill
                sizes="180px"
                className="object-cover object-center"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} opacity-50`} />
            </>
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient}`} />
          )}

          {/* Dekoratif daire */}
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

        {/* ── Orta: Alt kategoriler veya quick links ── */}
        <div className="flex-[2] py-5 px-6 border-r border-gray-100">
          {/* Alt kategoriler */}
          {subCategories.length > 0 ? (
            <>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase
                             tracking-[0.15em] mb-3">
                {category.name} Kategorileri
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                {subCategories.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/kategori/${sub.slug}`}
                    className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-600
                               hover:bg-orange-50 hover:text-orange rounded-xl transition-colors
                               font-medium group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-orange
                                     flex-shrink-0 transition-colors" />
                    {sub.name}
                  </Link>
                ))}
              </div>
            </>
          ) : (
            /* Alt kategori yoksa → Quick filter chips */
            <>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase
                             tracking-[0.15em] mb-3">
                Hızlı Filtreler
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { href: `/kategori/${category.slug}`, icon: Tag,  label: 'Tüm Ürünler' },
                  { href: `/urunler?categoryId=${category.id}&indirim=true`, icon: Zap,  label: '⚡ İndirimli' },
                  { href: `/urunler?categoryId=${category.id}&yeni=true`,   icon: Star, label: '🆕 Yeni Gelenler' },
                  { href: `/urunler?categoryId=${category.id}&sortBy=totalReviews&sortDir=DESC`, icon: Star, label: '🔥 En Çok Satan' },
                ].map(({ href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-[12px] font-semibold
                               rounded-full border border-gray-200 text-gray-700
                               hover:border-orange hover:text-orange hover:bg-orange-50
                               transition-all whitespace-nowrap"
                  >
                    {label}
                  </Link>
                ))}
              </div>

              {/* Beden hızlı seçimi */}
              <p className="text-[10px] font-extrabold text-gray-400 uppercase
                             tracking-[0.15em] mb-2">
                Bedene Göre
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {['XS','S','M','L','XL','XXL'].map((size) => (
                  <Link
                    key={size}
                    href={`/urunler?categoryId=${category.id}&sizes=${size}`}
                    className="min-w-[38px] h-8 flex items-center justify-center
                               text-xs font-bold border border-gray-200 rounded-xl
                               text-gray-600 hover:border-orange hover:text-orange
                               hover:bg-orange-50 transition-all"
                  >
                    {size}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Sağ: Öne çıkan ürünler ── */}
        <div className="w-[240px] flex-shrink-0 py-5 pl-6">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3">
            Öne Çıkanlar
          </p>

          {productList.length > 0 ? (
            <div className="flex flex-col gap-1">
              {productList.map((product) => (
                <Link
                  key={product.id}
                  href={`/urunler/${product.slug}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50
                             transition-colors group"
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={44}
                      height={44}
                      className="rounded-xl object-cover flex-shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className={`w-11 h-11 rounded-xl flex-shrink-0 flex items-center
                                     justify-center bg-gradient-to-br ${theme.gradient}`}>
                      <span className="text-lg font-extrabold text-white/90">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate
                                   group-hover:text-orange transition-colors leading-snug">
                      {product.name}
                    </p>
                    <p className="text-xs font-extrabold text-orange mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Ürün yoksa CTA */
            <div className="flex flex-col items-center justify-center h-[160px] text-center">
              <span className="text-3xl mb-2">{theme.icon}</span>
              <p className="text-xs text-gray-400 mb-3">Ürünler yükleniyor…</p>
              <Link
                href={`/kategori/${category.slug}`}
                className={`text-xs font-bold text-white px-4 py-2 rounded-xl
                             bg-gradient-to-r ${theme.gradient} hover:opacity-90 transition-opacity`}
              >
                Kategoriye Git →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
