'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import { CartItem } from './CartItem'
import { CouponInput } from './CouponInput'

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, syncFromCart } = useCartStore()
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)

  const { data: cart } = useQuery({
    queryKey: QUERY_KEYS.cart.all,
    queryFn: cartApi.get,
    enabled: !!token && isDrawerOpen,
    staleTime: 30 * 1000,
  })

  useEffect(() => {
    if (cart) syncFromCart(cart.itemCount, cart.totalAmount)
  }, [cart, syncFromCart])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    if (isDrawerOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isDrawerOpen, closeDrawer])

  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isDrawerOpen])

  const clearMutation = useMutation({
    mutationFn: cartApi.clear,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      setAppliedCoupon(null)
      toast.success('Sepet temizlendi')
    },
  })

  const items = cart?.items ?? []
  const isEmpty = items.length === 0
  const shipping = cart && cart.totalAmount >= 150 ? 0 : 29.90
  const grandTotal = (cart?.totalAmount ?? 0) + shipping

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 z-[400]"
            onClick={closeDrawer}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[410]
                       shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-navy-dark" />
                <h2 className="font-extrabold text-navy-dark">
                  Sepetim
                  {items.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({items.length} ürün)
                    </span>
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={() => clearMutation.mutate()}
                    disabled={clearMutation.isPending}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500
                               transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={13} />
                    Temizle
                  </button>
                )}
                <button
                  onClick={closeDrawer}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center
                             text-gray-500 transition-colors"
                  aria-label="Kapat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* İçerik */}
            {!token ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
                <ShoppingBag size={48} className="text-gray-200" />
                <p className="text-gray-500 font-medium text-center">
                  Sepetini görmek için giriş yapman gerekiyor
                </p>
                <Link
                  href="/giris"
                  onClick={closeDrawer}
                  className="px-6 py-3 bg-orange text-white font-bold rounded-xl
                             hover:bg-orange-dark transition-colors"
                >
                  Giriş Yap
                </Link>
              </div>
            ) : isEmpty ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
                <ShoppingBag size={48} className="text-gray-200" />
                <p className="text-gray-500 font-medium">Sepetiniz boş</p>
                <Link
                  href="/urunler"
                  onClick={closeDrawer}
                  className="px-6 py-3 bg-orange text-white font-bold rounded-xl
                             hover:bg-orange-dark transition-colors"
                >
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <>
                {/* Ürün listesi */}
                <div className="flex-1 overflow-y-auto px-5">
                  {items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>

                {/* Alt panel */}
                <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-white">
                  <CouponInput
                    appliedCoupon={appliedCoupon}
                    onApplied={setAppliedCoupon}
                    onRemoved={() => setAppliedCoupon(null)}
                  />

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Ara Toplam</span>
                      <span>{formatPrice(cart?.totalAmount ?? 0)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Kargo</span>
                      <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                        {shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between font-extrabold text-navy-dark
                                    pt-1 border-t border-gray-100">
                      <span>Toplam</span>
                      <span className="text-lg">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <Link
                    href="/odeme"
                    onClick={closeDrawer}
                    className="block w-full text-center bg-orange hover:bg-orange-dark text-white
                               font-bold py-3.5 rounded-xl transition-colors"
                  >
                    Ödemeye Geç
                  </Link>
                  <button
                    onClick={closeDrawer}
                    className="block w-full text-center text-sm text-gray-500 hover:text-navy-dark
                               transition-colors"
                  >
                    Alışverişe Devam Et
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
