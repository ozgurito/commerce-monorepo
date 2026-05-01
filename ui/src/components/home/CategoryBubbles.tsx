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

        {/* Cards — horizontal scroll on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {rootCats.map((cat: CategoryDto, i: number) => {
            const theme = CATEGORY_THEMES[i % CATEGORY_THEMES.length]
            return (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className="group flex flex-col items-center"
              >
                {/* Image circle */}
                <div className={`relative w-full aspect-square rounded-2xl overflow-hidden
                                 bg-gradient-to-br ${theme.gradient}
                                 group-hover:scale-105 group-hover:shadow-lg transition-all
                                 duration-300 mb-2 shadow-sm`}>
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      className="object-cover mix-blend-overlay opacity-90
                                 group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12.5vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl">{theme.emoji}</span>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10
                                  transition-colors duration-300" />
                </div>

                {/* Label */}
                <span className="text-xs font-bold text-navy-dark text-center leading-tight
                                 group-hover:text-orange transition-colors px-1">
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
