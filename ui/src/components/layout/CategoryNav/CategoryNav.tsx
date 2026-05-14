'use client'
import { useState, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, ChevronRight, LayoutGrid } from 'lucide-react'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { MegaMenuPanel } from './MegaMenuPanel'
import { AllCategoriesMenu } from './AllCategoriesMenu'
import type { CategoryDto } from '@/domains/categories/categories.types'

export function CategoryNav() {
  const pathname = usePathname()
  const [allOpen, setAllOpen] = useState(false)
  const [openSlug, setOpenSlug] = useState<string | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })

  // Backend yüklenene kadar gösterilecek hardcoded fallback kategoriler
  const FALLBACK_CATS: CategoryDto[] = [
    { id: 1, name: 'T-Shirt',    slug: 't-shirt',    parentId: null, isActive: true, imageUrl: null, description: null, displayOrder: 0, createdAt: '' },
    { id: 2, name: 'Hoodie',     slug: 'hoodie',     parentId: null, isActive: true, imageUrl: null, description: null, displayOrder: 1, createdAt: '' },
    { id: 3, name: 'Sweatshirt', slug: 'sweatshirt', parentId: null, isActive: true, imageUrl: null, description: null, displayOrder: 2, createdAt: '' },
    { id: 4, name: 'Eşofman',    slug: 'esofman',    parentId: null, isActive: true, imageUrl: null, description: null, displayOrder: 3, createdAt: '' },
    { id: 5, name: 'Şort',       slug: 'sort',       parentId: null, isActive: true, imageUrl: null, description: null, displayOrder: 4, createdAt: '' },
  ]

  const rootCats = categories.filter((c: CategoryDto) => c.parentId === null && c.isActive)
  // Gerçek data gelene kadar fallback kullan
  const displayCats = rootCats.length > 0 ? rootCats : FALLBACK_CATS

  const subMap: Record<number, CategoryDto[]> = {}
  categories.forEach((c: CategoryDto) => {
    if (c.parentId !== null) {
      if (!subMap[c.parentId]) subMap[c.parentId] = []
      subMap[c.parentId].push(c)
    }
  })

  const openAll = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenSlug(null)
    setAllOpen(true)
  }, [])

  const openCat = useCallback((slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setAllOpen(false)
    setOpenSlug(slug)   // always open mega menu, even with no subs
  }, [])

  const closeAll = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setAllOpen(false)
      setOpenSlug(null)
    }, 100)
  }, [])

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

  const activeCategory = displayCats.find((c: CategoryDto) => c.slug === openSlug)

  return (
    /* IMPORTANT: nav must be `relative` so absolute children position relative to it.
       onMouseLeave on nav closes all menus; dropdown panels are rendered as
       direct children of nav (NOT inside the overflow-x-auto inner div) so they are
       never clipped. */
    <nav
      className="bg-white border-b border-gray-100 sticky top-[68px] z-[200] relative"
      onMouseLeave={closeAll}
      onMouseEnter={cancelClose}
    >
      {/* ── Scrollable nav bar ── */}
      <div className="flex items-center w-full px-4 sm:px-6 lg:px-10 xl:px-14
                      overflow-x-auto scrollbar-none h-[44px]">

        {/* Tüm Ürünler */}
        <div
          className="relative flex-shrink-0 h-full flex items-center"
          onMouseEnter={openAll}
        >
          <button
            className={`flex items-center gap-1.5 h-full px-3 text-[13px] font-bold
                        whitespace-nowrap border-b-2 transition-all select-none
                        ${allOpen
                          ? 'text-orange border-orange'
                          : 'text-gray-700 border-transparent hover:text-orange hover:border-orange'}`}
          >
            <LayoutGrid size={14} className="flex-shrink-0" />
            Tüm Ürünler
            <ChevronDown
              size={11}
              className={`transition-transform duration-200 ${allOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Root kategoriler */}
        {displayCats.slice(0, 8).map((cat: CategoryDto) => {
          const isActive = pathname.startsWith(`/kategori/${cat.slug}`)
          const isOpen = openSlug === cat.slug

          return (
            <div
              key={cat.id}
              className="relative flex-shrink-0 h-full flex items-center"
              onMouseEnter={() => openCat(cat.slug)}
            >
              <Link
                href={`/kategori/${cat.slug}`}
                className={`flex items-center gap-1 h-full px-3 text-[13px] font-medium
                            whitespace-nowrap border-b-2 transition-all
                            ${isActive || isOpen
                              ? 'text-orange border-orange font-semibold'
                              : 'text-gray-600 border-transparent hover:text-orange hover:border-orange'}`}
              >
                {cat.name}
                <ChevronDown
                  size={10}
                  className={`text-gray-400 transition-transform duration-150
                              ${isOpen ? 'rotate-180 text-orange' : ''}`}
                />
              </Link>
            </div>
          )
        })}

        {/* Sabit: İndirimler */}
        <div
          className="relative flex-shrink-0 h-full flex items-center"
          onMouseEnter={() => { setAllOpen(false); setOpenSlug(null) }}
        >
          <Link
            href="/urunler?indirim=true"
            className={`flex items-center gap-1.5 h-full px-3 text-[13px] font-bold
                        whitespace-nowrap border-b-2 border-transparent text-red-500
                        hover:border-red-400 transition-all
                        ${pathname.includes('indirim') ? 'border-red-400' : ''}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            İndirimler
          </Link>
        </div>

        {/* Sabit: Yeni Gelenler */}
        <div
          className="relative flex-shrink-0 h-full flex items-center"
          onMouseEnter={() => { setAllOpen(false); setOpenSlug(null) }}
        >
          <Link
            href="/urunler?yeni=true"
            className="flex items-center gap-1.5 h-full px-3 text-[13px] font-medium
                       whitespace-nowrap border-b-2 border-transparent text-gray-600
                       hover:text-orange hover:border-orange transition-all"
          >
            Yeni Gelenler
            <span className="text-[9px] font-extrabold bg-orange text-white
                             px-1.5 py-0.5 rounded-full leading-none">YENİ</span>
          </Link>
        </div>
      </div>

      {/* ── Dropdown panels ── rendered OUTSIDE overflow div so they never get clipped ── */}

      {/* All-categories mega menu */}
      {allOpen && (
        <div
          className="absolute top-full left-0 right-0 z-[300]"
          onMouseEnter={cancelClose}
          onMouseLeave={closeAll}
        >
          <AllCategoriesMenu
            rootCats={displayCats}
            subMap={subMap}
            onClose={() => setAllOpen(false)}
          />
        </div>
      )}

      {/* Individual category mega menu */}
      {activeCategory && openSlug && !allOpen && (
        <div
          className="absolute top-full left-0 right-0 z-[300]"
          onMouseEnter={cancelClose}
          onMouseLeave={closeAll}
        >
          <MegaMenuPanel
            category={activeCategory}
            subCategories={subMap[activeCategory.id] ?? []}
            isOpen={true}
          />
        </div>
      )}
    </nav>
  )
}
