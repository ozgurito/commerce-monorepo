import apiClient from '@/lib/api-client'
import type { OrderDto, CreateOrderRequest, GuestOrderRequest } from './orders.types'

export interface PagedOrders {
  content: OrderDto[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
}

export const ordersApi = {
  create: async (req: CreateOrderRequest): Promise<OrderDto> => {
    const { data } = await apiClient.post('/api/orders', req)
    return data
  },

  createGuest: async (req: GuestOrderRequest): Promise<OrderDto> => {
    const { data } = await apiClient.post('/api/orders/guest', req)
    return data
  },

  getById: async (id: number): Promise<OrderDto> => {
    const { data } = await apiClient.get(`/api/orders/${id}`)
    return data
  },

  getByOrderNumber: async (orderNumber: string): Promise<OrderDto> => {
    const { data } = await apiClient.get(`/api/orders/guest/${orderNumber}`)
    return data
  },

  list: async (page = 0, size = 10): Promise<PagedOrders> => {
    const { data } = await apiClient.get('/api/orders', { params: { page, size } })
    return data
  },

  cancel: async (id: number): Promise<OrderDto> => {
    const { data } = await apiClient.post(`/api/orders/${id}/cancel`)
    return data
  },
}
