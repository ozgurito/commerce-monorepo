import apiClient from '@/lib/api-client'
import type { ReviewDto, ReviewCreateRequest } from './reviews.types'

export interface PagedReviews {
  content: ReviewDto[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  last: boolean
}

export const reviewsApi = {
  getByProduct: async (productId: number, page = 0, size = 10): Promise<PagedReviews> => {
    const { data } = await apiClient.get(`/api/reviews/product/${productId}`, {
      params: { page, size, sort: 'createdAt,desc' },
    })
    return data
  },

  create: async (req: ReviewCreateRequest): Promise<ReviewDto> => {
    const { data } = await apiClient.post('/api/reviews', req)
    return data
  },
}
