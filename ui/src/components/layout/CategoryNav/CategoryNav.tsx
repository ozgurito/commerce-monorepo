'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/ui.store'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { MegaMenuPanel } from './MegaMenuPanel'
import type { CategoryDto } from '@/domains/categories/categories.types'

export function CategoryNav() {
  const pathname = usePathname()
  const { megaMenuOpen, setMegaMenuOpen } = useUIStore()

  const { data: categories = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.all,
    queryFn: categoriesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })

  // Sadece kök kategoriler (parentId null)
  const rootCats = categories.filter((c: CategoryDto) => c.parentId === null && c.isActive)
  // Alt kategoriler map'i
  const subMap: Record<number, CategoryDto[]> = {}
  categories.forEach((c: CategoryDto) => {
    if (c.parentId !== null) {
      if (!subMap[c.parentId]) subMap[c.parentId] = []
      subMap[c.parentId].push(c)
    }
  })

  const activeCategory = rootCats.find((c: CategoryDto) => c.slug === megaMenuOpen)

  return (
    <nav
      className="bg-white border-b border-gray-200 sticky top-[68px] z-[200]"
      onMouseLeave={() => setMegaMenuOpen(null)}
    >
      <div className="flex items-center max-w-[1280px] mx-auto px-5 overflow-x-auto scrollbar-none">
        {/* Tüm Ürünler linki */}
        <Link
          href="/urunler"
          onMouseEnter={() => setMegaMenuOpen(null)}
          className={`flex items-center gap-[5px] h-[44px] px-3 text-[13px] font-semibold
                      whitespace-nowrap border-b-[2.5px] transition-colors flex-shrink-0
                      ${pathname === '/urunler'
                        ? 'text-orange border-orange'
                        : 'text-gray-600 border-transparent hover:text-orange hover:border-orange'}`}
        >
          Tüm Ürünler
        </Link>

        {rootCats.map((cat: CategoryDto) => {
          const isActive = pathname.startsWith(`/kategori/${cat.slug}`)
          const isOpen = megaMenuOpen === cat.slug
          const hasSubs = (subMap[cat.id] ?? []).length > 0

          return (
            <div
              key={cat.id}
              className="relative flex-shrink-0"
              onMouseEnter={() => hasSubs ? setMegaMenuOpen(cat.slug) : setMegaMenuOpen(null)}
            >
              <Link
                href={`/kategori/${cat.slug}`}
                className={`flex items-center gap-[5px] h-[44px] px-3 text-[13px] font-semibold
                            whitespace-nowrap border-b-[2.5px] transition-colors
                            ${isActive || isOpen
                              ? 'text-orange border-orange'
                              : 'text-gray-600 border-transparent hover:text-orange hover:border-orange'}`}
              >
                {cat.name}
              </Link>
            </div>
          )
        })}

        {/* Sabit linkler */}
        <Link
          href="/urunler?indirim=true"
          onMouseEnter={() => setMegaMenuOpen(null)}
          className="flex items-center gap-[5px] h-[44px] px-3 text-[13px] font-semibold
                     whitespace-nowrap border-b-[2.5px] border-transparent text-red-500
                     hover:border-red-500 transition-colors flex-shrink-0"
        >
          İndirimler
        </Link>
        <Link
          href="/urunler?yeni=true"
          onMouseEnter={() => setMegaMenuOpen(null)}
          className="flex items-center gap-[5px] h-[44px] px-3 text-[13px] font-semibold
                     whitespace-nowrap border-b-[2.5px] border-transparent text-gray-600
                     hover:text-orange hover:border-orange transition-colors flex-shrink-0
                     after:content-['YENİ'] after:text-[9px] after:font-extrabold after:bg-orange
                     after:text-white after:px-1 after:py-px after:rounded after:ml-1"
        >
          Yeni Gelenler
        </Link>
      </div>

      {/* MegaMenu panel */}
      {activeCategory && megaMenuOpen && (
        <MegaMenuPanel
          category={activeCategory}
          subCategories={subMap[activeCategory.id] ?? []}
          isOpen={true}
        />
      )}
    </nav>
  )
}
