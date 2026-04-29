'use client'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { productsApi } from '@/domains/products/products.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import type { CategoryDto } from '@/domains/categories/categories.types'

interface Props {
  category: CategoryDto
  subCategories: CategoryDto[]
  isOpen: boolean
}

export function MegaMenuPanel({ category, subCategories, isOpen }: Props) {
  const { data: featured } = useQuery({
    queryKey: QUERY_KEYS.products.list({ featured: true, categoryId: category.id, size: 4 }),
    queryFn: () => productsApi.getList({ featured: true, categoryId: category.id, size: 4 }),
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  })

  return (
    <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-200
                    shadow-hover z-[200] animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="max-w-[1280px] mx-auto px-5 py-6 flex gap-8">
        {/* Sol: Alt kategoriler (%65) */}
        <div className="flex-[2]">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            {category.name} Kategorileri
          </h3>
          <div className="grid grid-cols-3 gap-1">
            <Link
              href={`/kategori/${category.slug}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold
                         text-navy hover:bg-navy-50 transition-colors"
            >
              Tümünü Gör →
            </Link>
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/kategori/${sub.slug}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700
                           font-medium hover:bg-gray-50 hover:text-orange transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Sağ: Öne çıkan ürünler (%35) */}
        {featured && featured.content && featured.content.length > 0 && (
          <div className="flex-1 border-l border-gray-100 pl-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Öne Çıkanlar
            </h3>
            <div className="flex flex-col gap-2">
              {featured.content.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/urunler/${product.slug}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={44}
                      height={44}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate group-hover:text-orange transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs font-bold text-navy mt-0.5">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
