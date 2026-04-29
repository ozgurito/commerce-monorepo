import { create } from 'zustand'

interface UIState {
  authModalOpen: boolean
  authModalTab: 'login' | 'register'
  megaMenuOpen: string | null
  openAuthModal: (tab?: 'login' | 'register') => void
  closeAuthModal: () => void
  setMegaMenuOpen: (slug: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  authModalOpen: false,
  authModalTab:  'login',
  megaMenuOpen:  null,

  openAuthModal:   (tab = 'login') => set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal:  () => set({ authModalOpen: false }),
  setMegaMenuOpen: (slug) => set({ megaMenuOpen: slug }),
}))
