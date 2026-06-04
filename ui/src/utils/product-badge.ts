export interface ProductBadge {
  lines: [string, string]
  bg: string        // Tailwind bg class
  textColor: string // Tailwind text class
}

interface BadgeInput {
  totalReviews: number
  averageRating: number
  stock: number
  discountPct: number
  isOutOfStock: boolean
}

export function getProductBadge({
  totalReviews,
  averageRating,
  stock,
  discountPct,
  isOutOfStock,
}: BadgeInput): ProductBadge | null {
  if (isOutOfStock) return null

  if (totalReviews >= 5 && averageRating >= 4.5)
    return { lines: ['KULLANICILAR', 'BEĞENİYOR'], bg: 'bg-amber-500',   textColor: 'text-white' }
  if (totalReviews >= 2 && averageRating >= 4.0)
    return { lines: ['SEÇKİN',      'ÜRÜN'],       bg: 'bg-purple-500',  textColor: 'text-white' }
  if (totalReviews >= 5)
    return { lines: ['EN ÇOK',      'SATAN'],       bg: 'bg-orange',     textColor: 'text-white' }
  if (discountPct > 0)
    return { lines: ['AVANTAJLI',   'ÜRÜN'],        bg: 'bg-emerald-500', textColor: 'text-white' }
  if (stock > 0 && stock <= 10)
    return { lines: ['SON',         'ÜRÜNLER'],     bg: 'bg-red-500',    textColor: 'text-white' }

  return null
}
