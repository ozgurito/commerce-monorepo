'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/store/cart.store'

export function CartClearer() {
  const syncFromCart = useCartStore((state) => state.syncFromCart)
  const clearCoupon = useCartStore((state) => state.clearCoupon)

  useEffect(() => {
    syncFromCart(0, 0)
    clearCoupon()
  }, [syncFromCart, clearCoupon])

  return null
}
