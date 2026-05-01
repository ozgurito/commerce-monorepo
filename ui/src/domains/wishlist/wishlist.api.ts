import apiClient from '@/lib/api-client'
import type { WishlistItemDto } from './wishlist.types'

export const wishlistApi = {
  getAll: async (): Promise<WishlistItemDto[]> => {
    const { data } = await apiClient.get('/api/wishlist')
    // Backend returns Page<T> — extract .content; fallback to raw array for safety
    return data.content ?? data
  },

  add: async (productId: number) => {
    // Backend: POST /api/wishlist/{productId}  (path variable, no request body)
    const { data } = await apiClient.post(`/api/wishlist/${productId}`)
    return data
  },

  remove: async (productId: number) => {
    await apiClient.delete(`/api/wishlist/${productId}`)
  },

  check: async (productId: number): Promise<boolean> => {
    const { data } = await apiClient.get(`/api/wishlist/check/${productId}`)
    // Backend returns Map<String,Boolean>: { inWishlist: true/false }
    return data.inWishlist ?? data
  },

  getCount: async (): Promise<number> => {
    const { data } = await apiClient.get('/api/wishlist/count')
    // Backend returns Map<String,Long>: { count: N }
    return data.count ?? data
  },
}
