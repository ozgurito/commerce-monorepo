'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { CategoryDto } from '@/domains/categories/categories.types'

const CATEGORY_THEMES = [
  { gradient: 'from-pink-500 to-rose-600',     light: 'bg-pink-50',   emoji: '👗' },
  { gradient: 'from-blue-500 to-indigo-600',   light: 'bg-blue-50',   emoji: '👔' },
  { gradient: 'from-amber-500 to-orange-500',  light: 'bg-amber-50',  emoji: '🧥' },
  { gradient: 'from-green-500 to-emerald-600', light: 'bg-green-50',  emoji: '👟' },
  { gradient: 'from-purple-500 to-violet-600', light: 'bg-purple-50', emoji: '👜' },
  { gradient: 'from-teal-500 to-cyan-600',     light: 'bg-teal-50',   emoji: '🕶️' },
  { gradient: 'from-red-500 to-rose-600',      light: 'bg-red-50',    emoji: '🎽' },
  { gradient: 'from-yellow-500 to-amber-500',  light: 'bg-yellow-50', emoji: '🩴' },
]

// Kategori bubble'ları için özel kare ikonlar (DB image_url'dan bağımsız)
const BUBBLE_ICONS: Record<string, string> = {
  'tshirt':     '/images/cat-icon-tshirt.png',
  't-shirt':    '/images/cat-icon-tshirt.png',
  'hoodie':     '/images/cat-icon-hoodie.png',
  'sweatshirt': '/images/cat-icon-sweatshirt.png',
  'tank-top':   '/images/cat-icon-tanktop.png',
  'tanktop':    '/images/cat-icon-tanktop.png',
}

export function CategoryBubbles() {
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })

  const rootCats = categories
    .filter((c: CategoryDto) => c.parentId === null && c.isActive)
    .slice(0, 8)

  if (rootCats.length === 0) return null

  return (
    <section className="py-8">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-5 lg:px-10 xl:px-14">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold text-navy-dark">Kategoriler</h2>
            <p className="text-xs text-gray-400 mt-0.5">Tüm kategorileri keşfedin</p>
          </div>
          <Link
            href="/urunler"
            className="flex items-center gap-1 text-sm font-semibold text-orange
                       hover:text-orange-dark transition-colors"
          >
            Tümü <ChevronRight size={15} />
          </Link>
        </div>

        {/* Cards — mobilde yatay scroll, desktopta grid */}
        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 snap-x snap-mandatory
                        sm:grid sm:grid-cols-4 lg:grid-cols-8 sm:gap-3
                        [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {rootCats.map((cat: CategoryDto, i: number) => {
            const theme = CATEGORY_THEMES[i % CATEGORY_THEMES.length]
            const bubbleIcon = BUBBLE_ICONS[cat.slug] ?? cat.imageUrl ?? null
            return (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="flex flex-col items-center gap-2.5 group snap-start flex-shrink-0 w-[80px] sm:w-auto"
              >
                {/* Daire */}
                <div className={`relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] lg:w-[104px] lg:h-[104px]
                                 rounded-full overflow-hidden flex-shrink-0
                                 bg-gradient-to-br ${theme.gradient}
                                 ring-2 ring-transparent group-hover:ring-orange group-hover:ring-offset-2
                                 group-hover:scale-110 transition-all duration-250 shadow-md`}>
                  {bubbleIcon ? (
                    <Image
                      src={bubbleIcon}
                      alt={cat.name}
                      fill
                      className="object-cover object-center"
                      sizes="(min-width: 1024px) 104px, (min-width: 640px) 88px, 72px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl font-extrabold text-white/90 select-none">
                        {cat.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Etiket */}
                <span className="text-[11px] sm:text-[13px] font-semibold text-gray-700 text-center
                                 group-hover:text-orange transition-colors leading-tight
                                 line-clamp-2 max-w-[90px]">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
