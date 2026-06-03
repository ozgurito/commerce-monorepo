'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Trash2, Clock, Truck, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { userApi } from '@/domains/user/user.api'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useRecentlyViewed, type RecentItem } from '@/hooks/useRecentlyViewed'
import { formatPrice, FREE_SHIPPING_ITEM_COUNT, SHIPPING_COST } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'
import { CartItem } from './CartItem'
import { CouponInput } from './CouponInput'

export function CartDrawer() {
  const { isDrawerOpen, closeDrawer, syncFromCart, couponCode: appliedCoupon, discountAmount, applyCoupon, clearCoupon } = useCartStore()
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const { get: getRecentlyViewed } = useRecentlyViewed()
  const [recentItems, setRecentItems] = useState<RecentItem[]>([])

  const { data: cart } = useQuery({
    queryKey: QUERY_KEYS.cart.all,
    queryFn: cartApi.get,
    enabled: !!token && isDrawerOpen,
    staleTime: 30 * 1000,
  })

  // Hoş geldiniz kuponu — sepet açıkken ve kupon yoksa kontrol et
  const { data: welcomeCoupon } = useQuery({
    queryKey: ['welcome-coupon'],
    queryFn: userApi.getWelcomeCoupon,
    enabled: !!token && isDrawerOpen && !appliedCoupon,
    staleTime: 5 * 60 * 1000,
  })

  const applyWelcomeMutation = useMutation({
    mutationFn: () => cartApi.applyCoupon('WELCOME10'),
    onSuccess: (res: { couponCode: string; discountAmount: number }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      applyCoupon(res.couponCode ?? 'WELCOME10', Number(res.discountAmount ?? 0))
      toast.success('🎁 %10 hoş geldiniz indirimi uygulandı!')
    },
    onError: () => toast.error('Kupon uygulanamadı'),
  })

  useEffect(() => {
    if (cart) syncFromCart(cart.itemCount, cart.totalAmount)
  }, [cart, syncFromCart])

  useEffect(() => {
    if (isDrawerOpen) setRecentItems(getRecentlyViewed().slice(0, 4))
  }, [isDrawerOpen, getRecentlyViewed])

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
      clearCoupon()
      toast.success('Sepet temizlendi')
    },
  })

  const items = cart?.items ?? []
  const isEmpty = items.length === 0
  const totalQty = cart?.itemCount ?? 0   // backend: toplam miktar (2 adet = 2 sayılır)
  const subtotal = cart?.totalAmount ?? 0
  const discount = discountAmount ?? 0
  const discountedSubtotal = Math.max(0, subtotal - discount)
  const hasFreeShipping = totalQty >= FREE_SHIPPING_ITEM_COUNT
  const shipping = hasFreeShipping ? 0 : SHIPPING_COST
  const grandTotal = discountedSubtotal + shipping
  const itemsUntilFreeShipping = Math.max(0, FREE_SHIPPING_ITEM_COUNT - totalQty)

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
                  {totalQty > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      ({totalQty} ürün)
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
              <div className="flex-1 flex flex-col items-center gap-4 px-5 py-8 overflow-y-auto">
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

                {recentItems.length > 0 && (
                  <div className="w-full mt-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Clock size={13} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                        Son İncelenenler
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {recentItems.map((item) => (
                        <Link
                          key={item.id}
                          href={`/urunler/${item.slug}`}
                          onClick={closeDrawer}
                          className="group"
                        >
                          <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-1.5">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center
                                              font-extrabold text-xl text-gray-400">
                                {item.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-gray-700 line-clamp-2
                                         group-hover:text-orange transition-colors">
                            {item.name}
                          </p>
                          <p className="text-xs font-extrabold text-navy-dark mt-0.5">
                            {formatPrice(item.price)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
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
                  {/* Hoş geldiniz kuponu banner */}
                  {welcomeCoupon?.eligible && !appliedCoupon && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200
                                    rounded-xl px-3 py-2.5">
                      <Gift size={15} className="text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-amber-800">🎁 İlk siparişe %10 indirim!</p>
                        <p className="text-[10px] text-amber-600 font-medium">{welcomeCoupon.code}</p>
                      </div>
                      <button
                        onClick={() => applyWelcomeMutation.mutate()}
                        disabled={applyWelcomeMutation.isPending}
                        className="flex-shrink-0 bg-amber-500 hover:bg-amber-600 text-white
                                   text-[11px] font-bold px-2.5 py-1.5 rounded-lg
                                   transition-colors disabled:opacity-60 whitespace-nowrap"
                      >
                        {applyWelcomeMutation.isPending ? '…' : 'Uygula'}
                      </button>
                    </div>
                  )}

                  <CouponInput
                    appliedCoupon={appliedCoupon}
                    discountAmount={discountAmount}
                    onApplied={applyCoupon}
                    onRemoved={clearCoupon}
                  />

                  {/* Ücretsiz kargo progress */}
                  {!isEmpty && (
                    <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
                      {hasFreeShipping ? (
                        <div className="flex items-center gap-2 text-green-600">
                          <Truck size={14} className="flex-shrink-0" />
                          <span className="text-xs font-bold">Ücretsiz kargo kazandınız! 🎉</span>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 text-gray-600 mb-1.5">
                            <Truck size={14} className="text-orange flex-shrink-0" />
                            <span className="text-xs">
                              <strong className="text-orange">{itemsUntilFreeShipping} ürün</strong>
                              {' '}daha ekle, kargo bedava!
                            </span>
                          </div>
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange to-orange-dark rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (totalQty / FREE_SHIPPING_ITEM_COUNT) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1 text-right">
                            {totalQty}/{FREE_SHIPPING_ITEM_COUNT} ürün
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Ara Toplam</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center justify-between text-sm text-green-600 font-semibold">
                        <span>Kupon İndirimi</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
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
