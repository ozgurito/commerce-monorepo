'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Clock, X, ChevronDown, History } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { productsApi } from '@/domains/products/products.api'
import { useDebounce } from '@/hooks/useDebounce'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import { formatPrice } from '@/utils/format'
import Image from 'next/image'
import type { RecentItem } from '@/hooks/useRecentlyViewed'

const TRENDING = ['T-Shirt', 'Hoodie', 'Sweatshirt', 'Oversize', 'Denim', 'Elbise']

function loadHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return (JSON.parse(localStorage.getItem('search_history') ?? '[]') as string[]).slice(0, 5)
  } catch {
    return []
  }
}

export function SearchBar() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [history, setHistory] = useState<string[]>(loadHistory)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)
  const debouncedQ = useDebounce(q, 280)
  const { get: getRecent, clear: clearRecent } = useRecentlyViewed()

  // Derive recently-viewed — reads localStorage synchronously, cheap on every render
  const recent: RecentItem[] = useMemo(
    () => (open && q.length < 2 ? getRecent() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, q.length]
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data: results } = useQuery({
    queryKey: ['quick-search', debouncedQ],
    queryFn: () => productsApi.quickSearch(debouncedQ),
    enabled: debouncedQ.length >= 2,
    staleTime: 30_000,
  })

  const pushHistory = (term: string) => {
    const next = [term, ...history.filter(h => h !== term)].slice(0, 5)
    setHistory(next)
    try { localStorage.setItem('search_history', JSON.stringify(next)) } catch { /* ignore */ }
  }

  const handleSubmit = (e?: React.FormEvent, term?: string) => {
    e?.preventDefault()
    const query = (term ?? q).trim()
    if (query) {
      pushHistory(query)
      router.push(`/arama?keyword=${encodeURIComponent(query)}`)
      setOpen(false)
      setQ('')
    }
  }

  const handleTrending = (term: string) => {
    pushHistory(term)
    router.push(`/arama?keyword=${encodeURIComponent(term)}`)
    setOpen(false)
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('search_history')
  }

  const showTrending  = open && q.length < 2
  const showResults   = open && debouncedQ.length >= 2 && results && results.length > 0
  const showNoResults = open && debouncedQ.length >= 2 && results && results.length === 0
  const showDropdown  = showTrending || showResults || showNoResults

  return (
    <div ref={wrapRef} className="relative w-full" style={{ maxWidth: 680 }}>
      <form onSubmit={handleSubmit}>
        <div className={`flex rounded-[10px] overflow-hidden transition-shadow duration-200
                         ${open
                           ? 'shadow-[0_4px_24px_rgba(0,0,0,.35)]'
                           : 'shadow-[0_2px_12px_rgba(0,0,0,.2)]'}`}>
          {/* Category selector */}
          <button
            type="button"
            className="h-[46px] px-[14px] bg-white/10 text-white/80 text-[12px] font-semibold
                       border-r border-white/15 cursor-default whitespace-nowrap flex items-center
                       gap-[5px] flex-shrink-0 hover:bg-white/15 transition-colors"
          >
            Tüm Kategoriler
            <ChevronDown size={10} />
          </button>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            placeholder="Ürün, kategori veya marka ara..."
            className="flex-1 h-[46px] bg-white border-none px-4 text-[14px] outline-none
                       text-gray-800 placeholder:text-gray-400 min-w-0"
          />

          {/* Clear */}
          {q.length > 0 && (
            <button
              type="button"
              onClick={() => { setQ(''); inputRef.current?.focus() }}
              className="h-[46px] w-9 bg-white text-gray-400 hover:text-gray-600
                         flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <X size={15} />
            </button>
          )}

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

      {/* ── Dropdown ── */}
      {showDropdown && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 bg-white rounded-2xl
                        shadow-[0_12px_48px_rgba(0,0,0,.18)] border border-gray-100 z-50
                        overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">

          {/* ── Trending / recently viewed panel ── */}
          {showTrending && (
            <>
              {/* Recently viewed */}
              {recent.length > 0 && (
                <div className="p-4 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-extrabold text-gray-400 uppercase
                                  tracking-widest flex items-center gap-1.5">
                      <History size={11} />
                      Önceden Gezdiklerim
                    </p>
                    <button
                      onClick={() => clearRecent()}
                      className="text-[11px] text-gray-400 hover:text-red-500
                                 transition-colors font-semibold"
                    >
                      Temizle
                    </button>
                  </div>
                  <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
                    {recent.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          router.push(`/urunler/${item.slug}`)
                          setOpen(false)
                        }}
                        className="flex-shrink-0 w-[100px] group text-left"
                      >
                        <div className="w-full aspect-square rounded-xl overflow-hidden
                                        bg-gray-100 mb-1.5 border border-gray-100
                                        group-hover:border-orange transition-colors">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center
                                            text-gray-300 text-2xl">?</div>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-700 font-medium line-clamp-2
                                      leading-tight group-hover:text-orange transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-extrabold text-navy-dark mt-0.5">
                          {formatPrice(item.price)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search history chips */}
              {history.length > 0 && (
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-extrabold text-gray-400 uppercase
                                  tracking-widest flex items-center gap-1.5">
                      <Clock size={11} />
                      Son Aramalar
                    </p>
                    <button
                      onClick={clearHistory}
                      className="text-[11px] text-gray-400 hover:text-red-500
                                 transition-colors font-semibold"
                    >
                      Temizle
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {history.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleTrending(term)}
                        className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-100
                                   hover:bg-orange-50 hover:text-orange px-3 py-1.5 rounded-full
                                   transition-colors font-medium"
                      >
                        <Clock size={10} className="text-gray-400" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending searches */}
              <div className="px-4 py-3">
                <p className="text-[11px] font-extrabold text-gray-400 uppercase
                              tracking-widest mb-2.5 flex items-center gap-1.5">
                  <TrendingUp size={11} className="text-orange" />
                  Popüler Aramalar
                </p>
                <div className="flex flex-wrap gap-2">
                  {TRENDING.map((term) => (
                    <button
                      key={term}
                      onClick={() => handleTrending(term)}
                      className="text-xs text-gray-700 bg-gray-50 border border-gray-200
                                 hover:bg-orange hover:text-white hover:border-orange
                                 px-3 py-1.5 rounded-full transition-all font-semibold"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Search results ── */}
          {showResults && (
            <>
              <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
                <p className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Ürünler
                </p>
                <span className="text-[11px] text-gray-400">{results!.length} sonuç</span>
              </div>
              <div className="max-h-[380px] overflow-y-auto">
                {results!.slice(0, 7).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      router.push(`/urunler/${product.slug}`)
                      setOpen(false)
                      setQ('')
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50
                               transition-colors text-left group"
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
                      <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0
                                      flex items-center justify-center text-gray-300 font-bold">
                        ?
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate
                                   group-hover:text-orange transition-colors">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{product.categoryName}</p>
                    </div>
                    <span className="text-sm font-extrabold text-navy flex-shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleSubmit(undefined, q)}
                className="w-full py-3.5 text-sm font-bold text-orange border-t border-gray-100
                           hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <Search size={14} />
                &ldquo;{q}&rdquo; için tüm sonuçları gör
              </button>
            </>
          )}

          {/* ── No results ── */}
          {showNoResults && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500 mb-1">
                <strong>&ldquo;{q}&rdquo;</strong> için sonuç bulunamadı
              </p>
              <p className="text-xs text-gray-400 mb-4">Farklı bir kelime deneyin</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {TRENDING.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    onClick={() => handleTrending(term)}
                    className="text-xs text-orange bg-orange-50 border border-orange/20
                               px-3 py-1.5 rounded-full font-semibold hover:bg-orange
                               hover:text-white transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
