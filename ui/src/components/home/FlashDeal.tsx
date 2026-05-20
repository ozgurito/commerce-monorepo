'use client'
import { useState, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { productsApi } from '@/domains/products/products.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import type { ProductDto } from '@/domains/products/products.types'

function useCountdown(target: Date) {
  const [diff, setDiff] = useState(() => Math.max(0, target.getTime() - Date.now()))

  useEffect(() => {
    const id = setInterval(() => {
      setDiff(Math.max(0, target.getTime() - Date.now()))
    }, 1000)
    return () => clearInterval(id)
  }, [target])

  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  const s = Math.floor((diff % 60_000) / 1000)
  return { h, m, s }
}

function Digit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-navy-dark rounded-lg flex items-center justify-center">
        <span className="text-base sm:text-lg font-extrabold text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] text-gray-400 mt-0.5 font-medium">{label}</span>
    </div>
  )
}

function ProductCard({ product }: { product: ProductDto }) {
  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0

  return (
    <Link
      href={`/urunler/${product.slug}`}
      className="flex-shrink-0 w-[160px] sm:w-[180px] bg-white rounded-2xl border border-gray-100
                 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
    >
      <div className="relative h-[160px] sm:h-[180px] bg-gray-50 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="180px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-4xl font-bold">
            ?
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-extrabold
                           px-1.5 py-0.5 rounded">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[12px] font-semibold text-gray-800 line-clamp-2 leading-tight">
          {product.name}
        </p>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm font-extrabold text-navy-dark">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.comparePrice!)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

const SCROLL_AMOUNT = 196 * 3 // 3 kart (180px + 16px gap)

export function FlashDeal() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const { data: flashDeals = [] } = useQuery({
    queryKey: QUERY_KEYS.products.flashDeals,
    queryFn: productsApi.getFlashDeals,
    staleTime: 60 * 1000,
  })

  // Scroll pozisyonunu takip et → ok butonlarını göster/gizle
  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateArrows()
    el.addEventListener('scroll', updateArrows, { passive: true })
    window.addEventListener('resize', updateArrows)
    return () => {
      el.removeEventListener('scroll', updateArrows)
      window.removeEventListener('resize', updateArrows)
    }
  }, [flashDeals])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: 'smooth' })
  }

  const countdownTarget = useMemo(() => {
    if (flashDeals.length === 0) return new Date()
    const sorted = [...flashDeals]
      .filter(p => p.flashDealEndsAt)
      .sort((a, b) =>
        new Date(a.flashDealEndsAt!).getTime() - new Date(b.flashDealEndsAt!).getTime()
      )
    return sorted.length > 0 ? new Date(sorted[0].flashDealEndsAt!) : new Date()
  }, [flashDeals])

  const { h, m, s } = useCountdown(countdownTarget)

  if (flashDeals.length === 0) return null

  return (
    <section className="py-10">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-orange px-3 py-1.5 rounded-xl">
              <Zap size={16} className="text-white fill-white" />
              <span className="text-sm font-extrabold text-white">Flaş Fırsatlar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Digit value={h} label="SA" />
              <span className="text-xl font-extrabold text-navy-dark pb-4">:</span>
              <Digit value={m} label="DK" />
              <span className="text-xl font-extrabold text-navy-dark pb-4">:</span>
              <Digit value={s} label="SN" />
            </div>
          </div>

          {/* Sağ taraf: ok butonları + tümünü gör */}
          <div className="flex items-center gap-2">
            {/* Ok butonları — yalnızca desktop + scroll varsa */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                aria-label="Önceki"
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                aria-label="Sonraki"
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
                           text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <Link
              href="/urunler?indirim=true"
              className="text-sm font-semibold text-orange hover:underline hidden sm:block"
            >
              Tümünü Gör →
            </Link>
          </div>
        </div>

        {/* Product row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2 lg:max-w-[960px]"
        >
          {flashDeals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
