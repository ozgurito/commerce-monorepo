import { useCallback } from 'react'

const KEY = 'recently_viewed'
const MAX  = 6

export interface RecentItem {
  id:       number
  slug:     string
  name:     string
  price:    number
  imageUrl: string | null
}

function read(): RecentItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as RecentItem[]
  } catch {
    return []
  }
}

/** Call this on product detail page to track a view */
export function useRecentlyViewed() {
  const push = useCallback((item: RecentItem) => {
    const existing = read().filter(r => r.id !== item.id)
    const next     = [item, ...existing].slice(0, MAX)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }, [])

  const get = useCallback((): RecentItem[] => read(), [])

  const clear = useCallback(() => {
    try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  }, [])

  return { push, get, clear }
}
