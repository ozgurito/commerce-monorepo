import { create } from 'zustand'

interface CartState {
  itemCount: number
  totalAmount: number
  isDrawerOpen: boolean
  couponCode: string | null
  discountAmount: number | null
  setItemCount: (count: number) => void
  setTotalAmount: (amount: number) => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  syncFromCart: (itemCount: number, totalAmount: number) => void
  applyCoupon: (code: string, amount: number) => void
  clearCoupon: () => void
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  totalAmount: 0,
  isDrawerOpen: false,
  couponCode: null,
  discountAmount: null,

  setItemCount:   (itemCount)   => set({ itemCount }),
  setTotalAmount: (totalAmount) => set({ totalAmount }),
  openDrawer:  () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  syncFromCart: (itemCount, totalAmount) => set({ itemCount, totalAmount }),
  applyCoupon: (couponCode, discountAmount) => set({ couponCode, discountAmount }),
  clearCoupon: () => set({ couponCode: null, discountAmount: null }),
}))
