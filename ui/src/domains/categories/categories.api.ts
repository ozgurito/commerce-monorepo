import apiClient from '@/lib/api-client'
import type { CategoryDto, CategoryPathDto } from './categories.types'

export const categoriesApi = {
  getAll: async (): Promise<CategoryDto[]> => {
    const { data } = await apiClient.get('/api/categories')
    return data
  },

  getById: async (id: number): Promise<CategoryDto> => {
    const { data } = await apiClient.get(`/api/categories/${id}`)
    return data
  },

  getBySlug: async (slug: string): Promise<CategoryDto> => {
    const { data } = await apiClient.get(`/api/categories/slug/${slug}`)
    return data
  },

  getPath: async (id: number): Promise<CategoryPathDto[]> => {
    const { data } = await apiClient.get(`/api/categories/${id}/path`)
    return data
  },
}
