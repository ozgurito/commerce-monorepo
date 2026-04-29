import type { ProductSearchRequest } from '@/domains/products/products.types'

export const QUERY_KEYS = {
  products: {
    all:    ['products'] as const,
    list:   (p: Partial<ProductSearchRequest>) => ['products', 'list', p] as const,
    detail: (slug: string) => ['products', 'detail', slug] as const,
    featured: ['products', 'featured'] as const,
  },
  categories: {
    all:  ['categories'] as const,
    path: (id: number) => ['categories', 'path', id] as const,
  },
  cart:    { all: ['cart'] as const },
  wishlist: {
    all:   ['wishlist'] as const,
    check: (id: number) => ['wishlist', 'check', id] as const,
    count: ['wishlist', 'count'] as const,
  },
  orders: {
    all:    ['orders'] as const,
    detail: (id: number) => ['orders', id] as const,
    guest:  (orderNumber: string) => ['orders', 'guest', orderNumber] as const,
  },
  user:      { me: ['user', 'me'] as const },
  addresses: { all: ['addresses'] as const },
  reviews:   { product: (id: number) => ['reviews', 'product', id] as const },
  admin: {
    stats:    ['admin', 'stats'] as const,
    orders:   ['admin', 'orders'] as const,
    lowStock: ['admin', 'low-stock'] as const,
  },
} as const
