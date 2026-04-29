'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { productsApi } from '@/domains/products/products.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { useIntersection } from '@/hooks/useIntersection'
import { FilterSidebar } from './FilterSidebar'
import { SortBar } from './SortBar'
import { ActiveFilters } from './ActiveFilters'
import { ProductGrid } from './ProductGrid'
import { SkeletonGrid } from './SkeletonCard'
import type { CategoryDto } from '@/domains/categories/categories.types'
import type { ProductDto } from '@/domains/products/products.types'

const PAGE_SIZE = 20

export function ProductsView() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [filterOpen, setFilterOpen] = useState(false)
  const { ref: sentinelRef, isIntersecting: isSentinelVisible } = useIntersection()

  // URL'den filtre değerlerini oku
  const keyword     = searchParams.get('keyword') ?? undefined
  const categoryId  = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const minPrice    = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice    = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const colors      = searchParams.getAll('colors')
  const sizes       = searchParams.getAll('sizes')
  const sortBy      = searchParams.get('sortBy') ?? 'createdAt'
  const sortDir     = searchParams.get('sortDir') ?? 'DESC'
  const indirim     = searchParams.get('indirim') === 'true'
  const yeni        = searchParams.get('yeni') === 'true'

  // Kategori adını bul (ActiveFilters için)
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
    sortBy, sortDirection: sortDir as 'ASC' | 'DESC',
    size: PAGE_SIZE,
    ...(indirim && { inStockOnly: false }),
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: QUERY_KEYS.products.list(queryParams),
    queryFn: ({ pageParam }) =>
      productsApi.getList({ ...queryParams, page: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.number + 1,
    staleTime: 2 * 60 * 1000,
  })

  // Sentinel görününce sonraki sayfayı yükle
  useEffect(() => {
    if (isSentinelVisible && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isSentinelVisible, hasNextPage, isFetchingNextPage, fetchNextPage])

  const allProducts: ProductDto[] = data?.pages.flatMap((p) => p.content) ?? []
  const total = data?.pages[0]?.totalElements ?? 0

  // URL güncelleme
  const updateParams = useCallback((patch: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(patch).forEach(([k, v]) => {
      params.delete(k)
      if (Array.isArray(v)) {
        v.forEach((val) => params.append(k, val))
      } else if (v !== undefined && v !== '') {
        params.set(k, v)
      }
    })
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, router, pathname])

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
        <SortBar
          total={total}
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

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-10 mt-6 flex items-center justify-center">
              {isFetchingNextPage && (
                <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
              )}
              {!hasNextPage && allProducts.length > 0 && (
                <p className="text-xs text-gray-400">Tüm ürünler yüklendi</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
