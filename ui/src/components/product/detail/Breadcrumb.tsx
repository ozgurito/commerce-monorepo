'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { categoriesApi } from '@/domains/categories/categories.api'
import { QUERY_KEYS } from '@/lib/query-keys'

interface Props {
  categoryId: number | null | undefined
  productName: string
}

export function Breadcrumb({ categoryId, productName }: Props) {
  const { data: path = [] } = useQuery({
    queryKey: QUERY_KEYS.categories.path(categoryId ?? 0),
    queryFn: () => categoriesApi.getPath(categoryId!),
    enabled: !!categoryId,            // categoryId null/undefined/0 ise istek atma
    staleTime: 10 * 60 * 1000,
  })

  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-xs text-gray-400 mb-6">
      <Link href="/" className="hover:text-orange transition-colors">Ana Sayfa</Link>
      <ChevronRight size={12} className="flex-shrink-0" />
      <Link href="/urunler" className="hover:text-orange transition-colors">Ürünler</Link>

      {path.map((cat) => (
        <span key={cat.id} className="flex items-center gap-1">
          <ChevronRight size={12} className="flex-shrink-0" />
          <Link
            href={`/kategori/${cat.slug}`}
            className="hover:text-orange transition-colors"
          >
            {cat.name}
          </Link>
        </span>
      ))}

      <ChevronRight size={12} className="flex-shrink-0" />
      <span className="text-gray-600 font-medium truncate max-w-[200px]">{productName}</span>
    </nav>
  )
}
