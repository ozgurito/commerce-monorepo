import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthResponse } from '@/domains/auth/auth.types'

interface AuthUser {
  id: number
  email: string
  fullName: string
  role: string
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (res: AuthResponse) => void
  logout: () => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,

      login: (res) => {
        if (!res.token) return
        set({
          user: { id: res.userId, email: res.email, fullName: res.fullName, role: res.role },
          token: res.token,
          isAuthenticated: true,
          isAdmin: res.role === 'ADMIN',
        })
      },

      logout: () =>
        set({ user: null, token: null, isAuthenticated: false, isAdmin: false }),

      setToken: (token) =>
        set((state) => ({
          token,
          isAuthenticated: true,
          isAdmin: state.user?.role === 'ADMIN',
        })),
    }),
    { name: 'auth-storage' }
  )
)
