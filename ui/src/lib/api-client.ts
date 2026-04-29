import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // HttpOnly cookie refresh_token için
})

apiClient.interceptors.request.use((cfg) => {
  const token = useAuthStore.getState().token
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

let isRefreshing = false
let queue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const req = err.config
    if (err.response?.status === 401 && !req._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
          .then((token) => {
            req.headers.Authorization = `Bearer ${token}`
            return apiClient(req)
          })
      }
      req._retry = true
      isRefreshing = true
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        )
        // Backend RefreshTokenResponse.token (access_token değil)
        const newToken: string = data.token
        useAuthStore.getState().setToken(newToken)
        queue.forEach((p) => p.resolve(newToken))
        queue = []
        req.headers.Authorization = `Bearer ${newToken}`
        return apiClient(req)
      } catch (refreshErr) {
        queue.forEach((p) => p.reject(refreshErr))
        queue = []
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') window.location.href = '/giris'
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(err)
  }
)

export default apiClient
