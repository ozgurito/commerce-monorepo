import apiClient from '@/lib/api-client'
import type { ProductDto, ProductDetailDto, ProductSearchRequest, PagedResponse } from './products.types'

export const productsApi = {
  getList: async (params: ProductSearchRequest): Promise<PagedResponse<ProductDto>> => {
    const { data } = await apiClient.get('/api/products', { params })
    return data
  },

  getById: async (id: number): Promise<ProductDetailDto> => {
    const { data } = await apiClient.get(`/api/products/${id}`)
    return data
  },

  getBySlug: async (slug: string): Promise<ProductDetailDto> => {
    const { data } = await apiClient.get(`/api/products/slug/${slug}`)
    return data
  },

  getFeatured: async (): Promise<ProductDto[]> => {
    const { data } = await apiClient.get('/api/products/featured')
    return data
  },

  quickSearch: async (q: string): Promise<ProductDto[]> => {
    const { data } = await apiClient.get('/api/products/search/quick', { params: { q } })
    return data
  },

  searchAdvanced: async (req: ProductSearchRequest): Promise<PagedResponse<ProductDto>> => {
    const { data } = await apiClient.post('/api/products/search/advanced', req)
    return data
  },
}
