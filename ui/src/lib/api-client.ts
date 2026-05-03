import axios from 'axios'
import { useAuthStore } from '@/store/auth.store'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // HttpOnly cookie refresh_token için
})

/* ── JWT yardımcıları ─────────────────────────────────────── */
function getTokenExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

function isTokenExpiredOrStale(token: string, bufferMs = 2 * 60 * 1000): boolean {
  const exp = getTokenExpiry(token)
  if (!exp) return true
  return Date.now() >= exp - bufferMs // 2 dakika erken say
}

/* ── Refresh mantığı ─────────────────────────────────────── */
let isRefreshing = false
let queue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = []

async function doRefresh(): Promise<string> {
  const { data } = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/refresh`,
    {},
    { withCredentials: true }
  )
  const newToken: string = data.token ?? data.accessToken
  if (!newToken) throw new Error('No token in refresh response')
  useAuthStore.getState().setToken(newToken)
  return newToken
}

async function refreshToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => queue.push({ resolve, reject }))
  }
  isRefreshing = true
  try {
    const newToken = await doRefresh()
    queue.forEach((p) => p.resolve(newToken))
    return newToken
  } catch (err) {
    queue.forEach((p) => p.reject(err))
    useAuthStore.getState().logout()
    if (typeof window !== 'undefined') window.location.href = '/giris'
    throw err
  } finally {
    queue = []
    isRefreshing = false
  }
}

/* ── Request interceptor — proaktif yenileme ──────────────── */
apiClient.interceptors.request.use(async (cfg) => {
  let token = useAuthStore.getState().token
  if (!token) return cfg

  // Token süresi dolmuşsa veya 2 dakika kaldıysa önceden yenile
  if (isTokenExpiredOrStale(token)) {
    try {
      token = await refreshToken()
    } catch {
      // refreshToken zaten logout + redirect yapıyor
      return cfg
    }
  }

  cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

/* ── Response interceptor — 401 güvencesi ─────────────────── */
apiClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const req = err.config
    if (err.response?.status !== 401 || req._retry) {
      return Promise.reject(err)
    }
    req._retry = true

    // FormData isteklerini yeniden gönderemeyiz (body tüketildi)
    // Token yenile, yeni token'ı auth store'a yaz; kullanıcı tekrar deneyebilir
    const isFormData =
      req.data instanceof FormData ||
      (req.headers?.['Content-Type'] ?? '').toString().includes('multipart/form-data')

    try {
      const newToken = await refreshToken()
      if (isFormData) {
        // FormData isteğini retry edemeyiz; yeni token hazır, hatayı özel işaretle
        const enhancedErr = Object.assign(err, { _tokenRefreshed: true })
        return Promise.reject(enhancedErr)
      }
      req.headers.Authorization = `Bearer ${newToken}`
      return apiClient(req)
    } catch {
      return Promise.reject(err)
    }
  }
)

export default apiClient
