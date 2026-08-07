import { ProductVariantCard } from './ProductVariantCard'
import type { ProductDto } from '@/domains/products/products.types'

interface Props {
  products: ProductDto[]
  priorityCount?: number
}

export function ProductGrid({ products, priorityCount = 4 }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, i) => (
        <ProductVariantCard
          key={product.variantColor ? `${product.id}-${product.variantColor}` : product.id}
          product={product}
          priority={i < priorityCount}
        />
      ))}
    </div>
  )
}
