import apiClient from '@/lib/api-client'
import type { CartDto } from './cart.types'

export const cartApi = {
  get: async (): Promise<CartDto> => {
    const { data } = await apiClient.get('/api/cart')
    return data
  },

  addItem: async (body: { productId: number; variantId?: number; quantity: number }) => {
    const { data } = await apiClient.post('/api/cart/items', body)
    return data
  },

  updateItem: async (itemId: number, body: { quantity: number }) => {
    const { data } = await apiClient.put(`/api/cart/items/${itemId}`, body)
    return data
  },

  removeItem: async (itemId: number) => {
    await apiClient.delete(`/api/cart/items/${itemId}`)
  },

  clear: async () => {
    await apiClient.delete('/api/cart')
  },

  applyCoupon: async (code: string) => {
    const { data } = await apiClient.post('/api/cart/coupon', { code })
    return data
  },

  removeCoupon: async () => {
    await apiClient.delete('/api/cart/coupon')
  },
}
