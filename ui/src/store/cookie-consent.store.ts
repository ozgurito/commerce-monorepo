import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CookiePreferences {
  analytics: boolean
  functional: boolean
  marketing: boolean
}

interface CookieConsentState extends CookiePreferences {
  hasResponded: boolean
  acceptAll: () => void
  acceptNecessaryOnly: () => void
  setPreferences: (prefs: CookiePreferences) => void
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set) => ({
      hasResponded: false,
      analytics: false,
      functional: false,
      marketing: false,

      acceptAll: () =>
        set({ hasResponded: true, analytics: true, functional: true, marketing: true }),

      acceptNecessaryOnly: () =>
        set({ hasResponded: true, analytics: false, functional: false, marketing: false }),

      setPreferences: (prefs) =>
        set({ hasResponded: true, ...prefs }),
    }),
    { name: 'cookie-consent-storage' }
  )
)
