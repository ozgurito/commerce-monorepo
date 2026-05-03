'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { useRecentlyViewed, type RecentItem } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/utils/format'

function nameToGradient(name: string): string {
  const GRADIENTS = [
    'from-pink-200 to-rose-300',
    'from-blue-200 to-indigo-300',
    'from-amber-200 to-orange-300',
    'from-green-200 to-emerald-300',
    'from-purple-200 to-violet-300',
    'from-teal-200 to-cyan-300',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

interface Props {
  currentProductId: number
}

export function RecentlyViewedProducts({ currentProductId }: Props) {
  const { get } = useRecentlyViewed()
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    setItems(get().filter((item) => item.id !== currentProductId))
  }, [currentProductId, get])

  if (items.length === 0) return null

  return (
    <section className="mt-14 mb-4">
      <div className="flex items-center gap-2.5 mb-6">
        <div className="flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-xl">
          <Clock size={15} className="text-white" />
          <span className="text-sm font-extrabold text-white">Son İncelenenler</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => {
          const gradient = nameToGradient(item.name)
          return (
            <Link
              key={item.id}
              href={`/urunler/${item.slug}`}
              className="flex-shrink-0 w-36 group"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${gradient}
                                  flex items-center justify-center font-extrabold text-2xl text-white/90
                                  group-hover:scale-105 transition-transform duration-300`}>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-700 line-clamp-2 leading-snug
                             group-hover:text-orange transition-colors">
                {item.name}
              </p>
              <p className="text-sm font-extrabold text-navy-dark mt-0.5">
                {formatPrice(item.price)}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
