'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Package, MapPin, CreditCard, Clock,
  CheckCircle2, XCircle, Truck, Loader2, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '@/domains/orders/orders.api'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { OrderStatus } from '@/domains/orders/orders.types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:    { label: 'Beklemede',     color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: <Clock size={16} /> },
  PAID:       { label: 'Ödendi',        color: 'text-blue-600 bg-blue-50 border-blue-200',       icon: <CheckCircle2 size={16} /> },
  PROCESSING: { label: 'Hazırlanıyor',  color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <Package size={16} /> },
  SHIPPED:    { label: 'Kargoda',       color: 'text-indigo-600 bg-indigo-50 border-indigo-200', icon: <Truck size={16} /> },
  DELIVERED:  { label: 'Teslim Edildi', color: 'text-green-600 bg-green-50 border-green-200',    icon: <CheckCircle2 size={16} /> },
  CANCELLED:  { label: 'İptal Edildi',  color: 'text-red-600 bg-red-50 border-red-200',          icon: <XCircle size={16} /> },
  REFUNDED:   { label: 'İade Edildi',   color: 'text-gray-600 bg-gray-50 border-gray-200',       icon: <XCircle size={16} /> },
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD:      'Kredi / Banka Kartı',
  BANK_TRANSFER:    'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda Ödeme',
}

interface Props {
  params: Promise<{ id: string }>
}

export default function SiparisDetayPage({ params }: Props) {
  const queryClient = useQueryClient()
  const [orderId, setOrderId] = useState<number | null>(null)

  useEffect(() => {
    params.then(({ id }) => setOrderId(Number(id)))
  }, [params])

  const { data: order, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.orders.detail(orderId ?? 0),
    queryFn: () => ordersApi.getById(orderId!),
    enabled: !!orderId,
  })

  const cancelMutation = useMutation({
    mutationFn: () => ordersApi.cancel(orderId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.detail(orderId ?? 0) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders.all })
      toast.success('Sipariş iptal edildi')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'İptal işlemi başarısız')
    },
  })

  if (isLoading || !orderId) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-16">
        <AlertCircle size={32} className="text-red-400 mx-auto mb-3" />
        <p className="font-bold text-gray-500">Sipariş bulunamadı</p>
        <Link href="/hesabim/siparislerim" className="text-orange text-sm hover:underline mt-2 block">
          Siparişlere dön
        </Link>
      </div>
    )
  }

  const status = STATUS_CONFIG[order.status]
  const canCancel = order.status === 'PENDING' || order.status === 'PAID'

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <Link
          href="/hesabim/siparislerim"
          className="text-gray-400 hover:text-orange transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-navy-dark">Sipariş #{order.orderNumber}</h1>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
          </p>
        </div>
      </div>

      {/* Durum satırı */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${status.color}`}>
          {status.icon}
          <span className="font-bold text-sm">{status.label}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5">
          <CreditCard size={15} className="text-gray-400" />
          <span className="text-sm text-gray-600 font-medium">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </span>
        </div>
        {canCancel && (
          <button
            onClick={() => {
              if (confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
                cancelMutation.mutate()
              }
            }}
            disabled={cancelMutation.isPending}
            className="ml-auto flex items-center gap-1.5 text-sm text-red-500 font-semibold
                       border border-red-200 rounded-xl px-4 py-2.5 hover:bg-red-50 transition-colors
                       disabled:opacity-60"
          >
            {cancelMutation.isPending
              ? <><Loader2 size={13} className="animate-spin" /> İptal ediliyor…</>
              : <><XCircle size={14} /> Siparişi İptal Et</>}
          </button>
        )}
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
              <span>Ara Toplam</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>İndirim {order.couponCode && `(${order.couponCode})`}</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Kargo</span>
              <span className={order.shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                {order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between font-extrabold text-navy-dark pt-1 border-t border-gray-100 text-sm">
              <span>Toplam</span><span>{formatPrice(order.total)}</span>
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
        </div>
      </div>
    </div>
  )
}
