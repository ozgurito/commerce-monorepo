import { create } from 'zustand'

interface CartState {
  itemCount: number
  totalAmount: number
  isDrawerOpen: boolean
  setItemCount: (count: number) => void
  setTotalAmount: (amount: number) => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  syncFromCart: (itemCount: number, totalAmount: number) => void
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  totalAmount: 0,
  isDrawerOpen: false,

  setItemCount:   (itemCount)   => set({ itemCount }),
  setTotalAmount: (totalAmount) => set({ totalAmount }),
  openDrawer:  () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  syncFromCart: (itemCount, totalAmount) => set({ itemCount, totalAmount }),
}))
