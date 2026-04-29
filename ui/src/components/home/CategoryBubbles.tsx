'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { CategoryDto } from '@/domains/categories/categories.types'

const CATEGORY_COLORS = [
  'from-pink-100 to-rose-200',
  'from-blue-100 to-indigo-200',
  'from-amber-100 to-orange-200',
  'from-green-100 to-emerald-200',
  'from-purple-100 to-violet-200',
  'from-teal-100 to-cyan-200',
  'from-red-100 to-pink-200',
  'from-yellow-100 to-amber-200',
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
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-navy-dark">Kategoriler</h2>
          <Link
            href="/urunler"
            className="text-sm font-semibold text-orange hover:underline"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
          {rootCats.map((cat: CategoryDto, i: number) => (
            <Link
              key={cat.id}
              href={`/kategori/${cat.slug}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br
                              ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                              flex items-center justify-center overflow-hidden
                              ring-2 ring-transparent group-hover:ring-orange transition-all
                              group-hover:scale-105 duration-200`}>
                {cat.imageUrl ? (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-white/80 select-none">
                    {cat.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-700 text-center
                               group-hover:text-orange transition-colors leading-tight">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
