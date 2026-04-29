'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { ordersApi } from '@/domains/orders/orders.api'
import { useAuthStore } from '@/store/auth.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { CheckoutStepper } from '@/components/checkout/CheckoutStepper'
import { AddressPicker } from '@/components/checkout/AddressPicker'
import { GuestCheckoutForm } from '@/components/checkout/GuestCheckoutForm'
import { PaymentSelector } from '@/components/checkout/PaymentSelector'
import { OrderSummary } from '@/components/checkout/OrderSummary'
import type { Address, PaymentMethod } from '@/domains/orders/orders.types'

export default function OdemePage() {
  const router = useRouter()
  const { token } = useAuthStore()
  const { syncFromCart } = useCartStore()

  const [step, setStep] = useState(0)
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD')
  const [guestEmail, setGuestEmail] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: QUERY_KEYS.cart.all,
    queryFn: cartApi.get,
    enabled: !!token,
    staleTime: 30 * 1000,
  })

  // Stok kontrolü
  const outOfStockItems = cart?.items.filter((i) => i.availableStock === 0) ?? []
  const hasStockIssue = outOfStockItems.length > 0

  // --- Adım 0: Adres → Adım 1 ---
  const handleAddressConfirm = (address: Address) => {
    setShippingAddress(address)
    setStep(1)
  }

  // --- Adım 0 Guest: email + adres → Adım 1 ---
  const handleGuestData = ({ email, address }: { email: string; address: Address }) => {
    setGuestEmail(email)
    setShippingAddress(address)
    setStep(1)
  }

  // --- Adım 1: Ödeme onay → Sipariş oluştur ---
  const handlePlaceOrder = async () => {
    if (!shippingAddress || !cart) return
    setIsSubmitting(true)
    try {
      const items = cart.items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? undefined,
        quantity:  i.quantity,
      }))

      let order
      if (token) {
        order = await ordersApi.create({
          items,
          shippingAddress,
          billingAddress: shippingAddress,
          paymentMethod,
        })
      } else {
        order = await ordersApi.createGuest({
          guestEmail: guestEmail!,
          items,
          shippingAddress,
          billingAddress: shippingAddress,
          paymentMethod,
        })
      }

      syncFromCart(0, 0)

      if (paymentMethod === 'CREDIT_CARD') {
        router.push(`/odeme/iyzico?orderId=${order.id}`)
      } else if (paymentMethod === 'BANK_TRANSFER') {
        router.push(`/odeme/havale?orderId=${order.id}`)
      } else {
        // CASH_ON_DELIVERY
        router.push(`/odeme/cod?orderId=${order.id}`)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      toast.error(msg ?? 'Sipariş oluşturulamadı')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token && step === -1) {
    // initial guest decision — stay on 0
  }

  if (cartLoading) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 py-10 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-5 py-10 text-center">
        <p className="text-gray-500 text-lg">Sepetiniz boş.</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <h1 className="text-2xl font-extrabold text-navy-dark mb-6">Ödeme</h1>
      <CheckoutStepper current={step} />

      {/* Stok uyarısı */}
      {hasStockIssue && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Stok sorunu</p>
            <p className="text-xs text-red-600 mt-0.5">
              Şu ürünler stokta kalmadı:{' '}
              {outOfStockItems.map((i) => i.productName).join(', ')}.
              Lütfen sepetinizden kaldırın.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Adım içeriği */}
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-extrabold text-navy-dark mb-5">Teslimat Adresi</h2>
              {token ? (
                <AddressPicker
                  onSelect={handleAddressConfirm}
                  isLoading={isSubmitting}
                />
              ) : (
                <GuestCheckoutForm
                  onSubmit={handleGuestData}
                  isLoading={isSubmitting}
                />
              )}
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {/* Seçili adres özeti */}
              {shippingAddress && (
                <div className="mb-6 pb-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Teslimat Adresi
                    </p>
                    <button
                      onClick={() => setStep(0)}
                      className="text-xs text-orange hover:underline"
                    >
                      Değiştir
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {shippingAddress.fullName} · {shippingAddress.phone}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {shippingAddress.addressLine}, {shippingAddress.district}/{shippingAddress.city}
                  </p>
                </div>
              )}

              <h2 className="font-extrabold text-navy-dark mb-5">Ödeme Yöntemi</h2>
              <PaymentSelector
                selected={paymentMethod}
                onChange={setPaymentMethod}
                onConfirm={handlePlaceOrder}
                isLoading={isSubmitting || hasStockIssue}
              />
            </div>
          )}
        </div>

        {/* Sağ: Sipariş özeti */}
        <div className="lg:col-span-1">
          <OrderSummary cart={cart} />
        </div>
      </div>
    </div>
  )
}
