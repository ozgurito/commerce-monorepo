'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/domains/products/products.api'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPrice } from '@/utils/format'
import Image from 'next/image'

export function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const debouncedQ = useDebounce(q, 300)

  const { data: results } = useQuery({
    queryKey: ['quick-search', debouncedQ],
    queryFn: () => productsApi.quickSearch(debouncedQ),
    enabled: debouncedQ.length >= 2,
    staleTime: 30_000,
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (q.trim()) {
      router.push(`/arama?q=${encodeURIComponent(q.trim())}`)
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="flex-1 max-w-[680px] relative">
      <form onSubmit={handleSubmit}>
        <div className="flex rounded-[10px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,.2)]">
          {/* Category selector */}
          <button
            type="button"
            className="h-[46px] px-[14px] bg-white/10 text-white/80 text-[12.5px] font-semibold
                       border-r border-white/15 cursor-pointer whitespace-nowrap flex items-center gap-[5px]
                       hover:bg-white/17 transition-colors flex-shrink-0"
          >
            Tüm Kategoriler
            <ChevronDown size={10} />
          </button>

          {/* Input */}
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true) }}
            onFocus={() => q.length >= 2 && setOpen(true)}
            placeholder="Ürün, kategori veya marka ara..."
            className="flex-1 h-[46px] bg-white border-none px-[14px] text-[14px] outline-none
                       text-gray-800 placeholder:text-gray-400"
          />

          {/* Search button */}
          <button
            type="submit"
            className="w-[52px] h-[46px] bg-orange flex items-center justify-center text-white
                       hover:bg-orange-dark transition-colors flex-shrink-0"
          >
            <Search size={20} />
          </button>
        </div>
      </form>

      {/* Dropdown results */}
      {open && results && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-hover
                        border border-gray-200 z-50 max-h-[400px] overflow-y-auto">
          {results.slice(0, 8).map((product) => (
            <button
              key={product.id}
              onClick={() => {
                router.push(`/urunler/${product.slug}`)
                setOpen(false)
                setQ('')
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
            >
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-xs text-gray-400">{product.categoryName}</p>
              </div>
              <span className="text-sm font-bold text-navy flex-shrink-0">
                {formatPrice(product.price)}
              </span>
            </button>
          ))}
          <button
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="w-full py-3 text-center text-sm font-semibold text-orange
                       border-t border-gray-100 hover:bg-orange-light transition-colors"
          >
            &ldquo;{q}&rdquo; için tüm sonuçları gör →
          </button>
        </div>
      )}
    </div>
  )
}
