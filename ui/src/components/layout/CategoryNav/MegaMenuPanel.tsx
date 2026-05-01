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
    <div className="bg-white shadow-[0_8px_40px_rgba(0,0,0,.15)] border-t border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 py-5 flex gap-8">

        {/* Left: subcategories */}
        <div className="flex-[2]">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3">
            {category.name} Kategorileri
          </p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
            <Link
              href={`/kategori/${category.slug}`}
              className="flex items-center gap-2 px-3 py-2.5 text-[13px] font-bold
                         text-navy hover:bg-navy-50 hover:text-orange rounded-xl transition-colors"
            >
              Tümünü Gör →
            </Link>
            {subCategories.map((sub) => (
              <Link
                key={sub.id}
                href={`/kategori/${sub.slug}`}
                className="flex items-center gap-2 px-3 py-2.5 text-[13px] text-gray-600
                           hover:bg-orange-50 hover:text-orange rounded-xl transition-colors
                           font-medium group"
              >
                <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-orange
                                 flex-shrink-0 transition-colors" />
                {sub.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: featured products */}
        {featured && featured.content && featured.content.length > 0 && (
          <div className="w-[220px] flex-shrink-0 border-l border-gray-100 pl-7">
            <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.15em] mb-3">
              Öne Çıkanlar
            </p>
            <div className="flex flex-col gap-1">
              {featured.content.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/urunler/${product.slug}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50
                             transition-colors group"
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
                    <div className="w-11 h-11 rounded-xl bg-gray-100 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate
                                 group-hover:text-orange transition-colors">
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
