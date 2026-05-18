'use client'
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { productsApi } from '@/domains/products/products.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { FilterSidebar } from './FilterSidebar'
import { SortBar } from './SortBar'
import { QuickFilterChips } from './QuickFilterChips'
import { ActiveFilters } from './ActiveFilters'
import { ProductGrid } from './ProductGrid'
import { SkeletonGrid } from './SkeletonCard'
import type { CategoryDto } from '@/domains/categories/categories.types'

const PAGE_SIZE = 24

interface Props {
  defaultCategoryId?: number
}

export function ProductsView({ defaultCategoryId }: Props = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [filterOpen, setFilterOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // URL'den filtre değerlerini oku
  const keyword    = searchParams.get('keyword') ?? undefined
  const categoryId = searchParams.get('categoryId')
    ? Number(searchParams.get('categoryId'))
    : defaultCategoryId
  const minPrice   = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice   = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const colors     = searchParams.getAll('colors')
  const sizes      = searchParams.getAll('sizes')
  const sortBy     = searchParams.get('sortBy') ?? 'createdAt'
  const sortDir    = searchParams.get('sortDir') ?? 'DESC'
  const indirim    = searchParams.get('indirim') === 'true'
  const yeni       = searchParams.get('yeni') === 'true'
  const page       = searchParams.get('page') ? Number(searchParams.get('page')) : 0

  // Kategori adını bul
  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })
  const categoryName = categories.find((c: CategoryDto) => c.id === categoryId)?.name

  const queryParams = {
    keyword, categoryId, minPrice, maxPrice,
    colors: colors.length ? colors : undefined,
    sizes:  sizes.length  ? sizes  : undefined,
    // "Yeni Gelenler" seçiliyse createdAt DESC sırala; aksi halde URL'deki sortBy/sortDir kullan
    sortBy:        yeni ? 'createdAt' : sortBy,
    sortDirection: yeni ? 'DESC'      : sortDir as 'ASC' | 'DESC',
    size: PAGE_SIZE, page,
    ...(indirim && { inStockOnly: false }),
  }

  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.products.list(queryParams),
    queryFn: () => productsApi.getList(queryParams),
    staleTime: 2 * 60 * 1000,
    placeholderData: (prev) => prev,
  })

  const allProducts = data?.content ?? []
  const total       = data?.totalElements ?? 0
  const totalPages  = data?.totalPages ?? 1

  // URL güncelleme — filtre değişince sayfa 0'a döner
  const updateParams = useCallback((patch: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    // Filtre değişince sayfayı sıfırla
    if (!('page' in patch)) params.delete('page')
    Object.entries(patch).forEach(([k, v]) => {
      params.delete(k)
      if (Array.isArray(v)) {
        v.forEach((val) => params.append(k, val))
      } else if (v !== undefined && v !== '') {
        params.set(k, v)
      }
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: true })
  }, [searchParams, router, pathname])

  const goToPage = (p: number) => {
    updateParams({ page: p === 0 ? undefined : String(p) })
  }

  const handleFilterChange = (patch: {
    categoryId?: number
    minPrice?: number
    maxPrice?: number
    colors?: string[]
    sizes?: string[]
  }) => {
    const urlPatch: Record<string, string | string[] | undefined> = {}
    if ('categoryId' in patch) urlPatch.categoryId = patch.categoryId?.toString()
    if ('minPrice' in patch)   urlPatch.minPrice = patch.minPrice?.toString()
    if ('maxPrice' in patch)   urlPatch.maxPrice = patch.maxPrice?.toString()
    if ('colors' in patch)     urlPatch.colors = patch.colors
    if ('sizes' in patch)      urlPatch.sizes = patch.sizes
    updateParams(urlPatch)
  }

  const handleReset = () => {
    router.push(pathname, { scroll: false })
  }

  const handleRemoveFilter = (key: string, value?: string) => {
    if (key === 'colors' || key === 'sizes') {
      const current = key === 'colors' ? colors : sizes
      updateParams({ [key]: current.filter((x) => x !== value) })
    } else {
      updateParams({ [key]: undefined })
    }
  }

  const handleSortChange = (sb: string, sd: string) => {
    updateParams({ sortBy: sb, sortDir: sd })
  }

  // Server/client içerik uyuşmazlığını (hydration) önle
  if (!mounted) return <SkeletonGrid count={PAGE_SIZE} />

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <FilterSidebar
        filters={{ categoryId, minPrice, maxPrice, colors, sizes }}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />

      {/* Ana içerik */}
      <div className="flex-1 min-w-0">

        <QuickFilterChips
          searchParams={searchParams}
          onChipClick={(patch) => updateParams(patch)}
        />

        <SortBar
          total={total}
          isLoading={isLoading}
          sortBy={sortBy}
          sortDirection={sortDir}
          onSortChange={handleSortChange}
          onFilterOpen={() => setFilterOpen(true)}
        />

        <ActiveFilters
          filters={{ keyword, categoryId, categoryName, minPrice, maxPrice, colors, sizes }}
          onRemove={handleRemoveFilter}
        />

        {isLoading ? (
          <SkeletonGrid count={PAGE_SIZE} />
        ) : allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-5xl mb-4">🔍</p>
            <p className="font-bold text-navy-dark text-lg">Ürün bulunamadı</p>
            <p className="text-gray-500 text-sm mt-1">Farklı filtreler deneyin</p>
            <button
              onClick={handleReset}
              className="mt-5 px-5 py-2.5 bg-orange text-white font-bold rounded-xl
                         hover:bg-orange-dark transition-colors text-sm"
            >
              Filtreleri Temizle
            </button>
          </div>
        ) : (
          <>
            <ProductGrid products={allProducts} />

            {/* Klasik Sayfalama */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-10 mb-4">
                {/* Önceki */}
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200
                             text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>

                {/* Sayfa numaraları */}
                {Array.from({ length: totalPages }, (_, i) => i).filter(i => {
                  if (totalPages <= 7) return true
                  if (i === 0 || i === totalPages - 1) return true
                  if (Math.abs(i - page) <= 2) return true
                  return false
                }).reduce<(number | 'ellipsis')[]>((acc, i, idx, arr) => {
                  if (idx > 0 && (i as number) - (arr[idx - 1] as number) > 1) acc.push('ellipsis')
                  acc.push(i)
                  return acc
                }, []).map((item, idx) =>
                  item === 'ellipsis' ? (
                    <span key={`e${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item as number)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors
                        ${page === item
                          ? 'bg-orange text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {(item as number) + 1}
                    </button>
                  )
                )}

                {/* Sonraki */}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200
                             text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
