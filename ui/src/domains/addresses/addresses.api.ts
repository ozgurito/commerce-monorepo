import apiClient from '@/lib/api-client'
import type { UserAddressDto, UserAddressRequest } from './addresses.types'

export const addressesApi = {
  getAll: async (): Promise<UserAddressDto[]> => {
    const { data } = await apiClient.get('/api/addresses')
    return data
  },

  getById: async (id: number): Promise<UserAddressDto> => {
    const { data } = await apiClient.get(`/api/addresses/${id}`)
    return data
  },

  create: async (req: UserAddressRequest): Promise<UserAddressDto> => {
    const { data } = await apiClient.post('/api/addresses', req)
    return data
  },

  update: async (id: number, req: UserAddressRequest): Promise<UserAddressDto> => {
    const { data } = await apiClient.put(`/api/addresses/${id}`, req)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/addresses/${id}`)
  },

  setDefault: async (id: number): Promise<UserAddressDto> => {
    const { data } = await apiClient.put(`/api/addresses/${id}/default`)
    return data
  },
}
