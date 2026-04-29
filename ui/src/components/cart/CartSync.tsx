'use client'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cartApi } from '@/domains/cart/cart.api'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { QUERY_KEYS } from '@/lib/query-keys'

/**
 * Sayfa yüklendiğinde sepet sayısını CartStore ile senkronize eder.
 * Header'daki badge bu store'dan okur.
 */
export function CartSync() {
  const { token } = useAuthStore()
  const { syncFromCart } = useCartStore()

  const { data: cart } = useQuery({
    queryKey: QUERY_KEYS.cart.all,
    queryFn: cartApi.get,
    enabled: !!token,
    staleTime: 60 * 1000,
  })

  useEffect(() => {
    if (cart) {
      syncFromCart(cart.itemCount, cart.totalAmount)
    }
  }, [cart, syncFromCart])

  return null
}
