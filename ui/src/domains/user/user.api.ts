import apiClient from '@/lib/api-client'
import type { UserDto, UpdateProfileRequest } from './user.types'

export const userApi = {
  getMe: async (): Promise<UserDto> => {
    const { data } = await apiClient.get('/api/users/me')
    return data
  },

  updateProfile: async (req: UpdateProfileRequest): Promise<UserDto> => {
    const { data } = await apiClient.put('/api/users/me', req)
    return data
  },

  getWelcomeCoupon: async (): Promise<{ eligible: boolean; code: string; discountPercent: number }> => {
    const { data } = await apiClient.get('/api/users/me/welcome-coupon')
    return data
  },
}
