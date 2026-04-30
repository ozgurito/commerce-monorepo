import apiClient from '@/lib/api-client'
import type {
  AuthRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from './auth.types'

export const authApi = {
  login: async (req: AuthRequest): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/login', req)
    return data
  },

  register: async (req: { fullName: string; email: string; password: string }): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/register', req)
    return data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout')
  },

  forgotPassword: async (req: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/api/auth/forgot-password', req)
  },

  resetPassword: async (req: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/api/auth/reset-password', req)
  },
}
