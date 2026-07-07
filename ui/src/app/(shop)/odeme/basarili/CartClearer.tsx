'use client'

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@/store/cart.store'
import { cartApi } from '@/domains/cart/cart.api'
import { QUERY_KEYS } from '@/lib/query-keys'

export function CartClearer() {
  const syncFromCart = useCartStore((state) => state.syncFromCart)
  const clearCoupon = useCartStore((state) => state.clearCoupon)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Yerel (zustand) rozet sayacını hemen sıfırla
    syncFromCart(0, 0)
    clearCoupon()

    // Sunucudaki gerçek sepeti de temizle — aksi halde CartDrawer bir sonraki
    // açılışta sunucudan eski (temizlenmemiş) sepeti çekip geri getiriyordu.
    cartApi.clear()
      .then(() => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all }))
      .catch(() => { /* sessizce yut — kullanıcıya görünen bir şey değişmiyor */ })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}
