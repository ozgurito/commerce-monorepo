'use client'
import { useEffect, useState } from 'react'
import { Package, MapPin, CreditCard, Clock, CheckCircle2, XCircle, Truck } from 'lucide-react'
import { ordersApi } from '@/domains/orders/orders.api'
import { formatPrice } from '@/utils/format'
import type { OrderDto, OrderStatus } from '@/domains/orders/orders.types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:   { label: 'Beklemede',     color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock size={16} /> },
  PAID:      { label: 'Ödendi',        color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: <CheckCircle2 size={16} /> },
  PROCESSING:{ label: 'Hazırlanıyor',  color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Package size={16} /> },
  SHIPPED:   { label: 'Kargoda',       color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: <Truck size={16} /> },
  DELIVERED: { label: 'Teslim Edildi', color: 'text-green-600 bg-green-50 border-green-200',    icon: <CheckCircle2 size={16} /> },
  CANCELLED: { label: 'İptal Edildi',  color: 'text-red-600 bg-red-50 border-red-200',          icon: <XCircle size={16} /> },
  REFUNDED:  { label: 'İade Edildi',   color: 'text-gray-600 bg-gray-50 border-gray-200',       icon: <XCircle size={16} /> },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD:    'Kredi / Banka Kartı',
  BANK_TRANSFER:  'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda Ödeme',
}

interface Props {
  params: Promise<{ orderNumber: string }>
}

export default function MisafirSiparisPage({ params }: Props) {
  const [orderNumber, setOrderNumber] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderDto | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    params.then(({ orderNumber: on }) => {
      setOrderNumber(on)
      ordersApi
        .getByOrderNumber(on)
        .then(setOrder)
        .catch(() => setError('Sipariş bulunamadı. Sipariş numaranızı kontrol edin.'))
        .finally(() => setLoading(false))
    })
  }, [params])

  if (loading) {
    return (
      <div className="max-w-[700px] mx-auto px-5 py-16 text-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-[560px] mx-auto px-5 py-16 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-extrabold text-navy-dark mb-2">Sipariş Bulunamadı</h1>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <p className="text-xs text-gray-400">
          Aranan sipariş no: <span className="font-mono font-semibold">{orderNumber}</span>
        </p>
      </div>
    )
  }

  const status = STATUS_CONFIG[order.status]
  const shipping = order.shippingCost > 0 ? order.shippingCost : 0

  return (
    <div className="max-w-[700px] mx-auto px-5 py-10">
      {/* Başlık */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-navy-dark">Sipariş Takibi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Sipariş No:{' '}
          <span className="font-mono font-bold text-navy-dark">{order.orderNumber}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Durum */}
        <div className={`flex items-center gap-2 border rounded-xl px-4 py-3 ${status.color}`}>
          {status.icon}
          <span className="font-bold text-sm">{status.label}</span>
        </div>

        {/* Ödeme yöntemi */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <CreditCard size={16} className="text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 font-medium">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        </div>

        {/* Tarih */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
          <Clock size={16} className="text-gray-500 flex-shrink-0" />
          <span className="text-sm text-gray-700 font-medium">
            {new Date(order.createdAt).toLocaleDateString('tr-TR', {
              day: '2-digit', month: 'long', year: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ürünler */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <Package size={16} className="text-orange" /> Ürünler
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center
                                text-navy-dark font-bold text-sm flex-shrink-0">
                  {item.productName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.productName}</p>
                  {item.variantName && (
                    <p className="text-[10px] text-gray-400">{item.variantName}</p>
                  )}
                  <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-navy-dark flex-shrink-0">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Toplamlar */}
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Ara Toplam</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>İndirim</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Kargo</span>
              <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                {shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between font-extrabold text-navy-dark pt-1 border-t border-gray-100">
              <span className="text-sm">Toplam</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Teslimat adresi */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-orange" /> Teslimat Adresi
          </h2>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>
            <p className="text-xs text-gray-600 mt-2 leading-relaxed">
              {order.shippingAddress.addressLine}
            </p>
            <p className="text-xs text-gray-500">
              {order.shippingAddress.district} / {order.shippingAddress.city}
            </p>
            {order.shippingAddress.postalCode && (
              <p className="text-xs text-gray-400">{order.shippingAddress.postalCode}</p>
            )}
          </div>

          {/* E-posta */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
              E-posta
            </p>
            <p className="text-sm text-gray-700">{order.userEmail}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
