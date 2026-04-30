import apiClient from '@/lib/api-client'
import type { WishlistItemDto } from './wishlist.types'

export const wishlistApi = {
  getAll: async (): Promise<WishlistItemDto[]> => {
    const { data } = await apiClient.get('/api/wishlist')
    return data
  },

  add: async (productId: number) => {
    const { data } = await apiClient.post('/api/wishlist', { productId })
    return data
  },

  remove: async (productId: number) => {
    await apiClient.delete(`/api/wishlist/${productId}`)
  },

  check: async (productId: number): Promise<boolean> => {
    const { data } = await apiClient.get(`/api/wishlist/check/${productId}`)
    return data
  },

  getCount: async (): Promise<number> => {
    const { data } = await apiClient.get('/api/wishlist/count')
    return data
  },
}
