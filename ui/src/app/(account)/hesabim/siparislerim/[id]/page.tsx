'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Package, MapPin, CreditCard,
  Clock, CheckCircle2, Truck, Loader2, AlertCircle, XCircle, RefreshCw,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ordersApi } from '@/domains/orders/orders.api'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { OrderStatus } from '@/domains/orders/orders.types'

/* ── Status config ── */
type StatusCfg = { label: string; badge: string; icon: React.ReactNode }
const STATUS_CONFIG: Record<OrderStatus, StatusCfg> = {
  PENDING:    { label: 'Beklemede',     badge: 'text-amber-700 bg-amber-50 border-amber-200',   icon: <Clock        size={15}/> },
  PAID:       { label: 'Ödendi',        badge: 'text-blue-700 bg-blue-50 border-blue-200',       icon: <CheckCircle2 size={15}/> },
  PROCESSING: { label: 'Hazırlanıyor',  badge: 'text-purple-700 bg-purple-50 border-purple-200', icon: <Package      size={15}/> },
  SHIPPED:    { label: 'Kargoda',       badge: 'text-indigo-700 bg-indigo-50 border-indigo-200', icon: <Truck        size={15}/> },
  DELIVERED:  { label: 'Teslim Edildi', badge: 'text-green-700 bg-green-50 border-green-200',    icon: <CheckCircle2 size={15}/> },
  CANCELLED:  { label: 'İptal Edildi',  badge: 'text-red-700 bg-red-50 border-red-200',          icon: <XCircle      size={15}/> },
  REFUNDED:   { label: 'İade Edildi',   badge: 'text-gray-600 bg-gray-50 border-gray-200',       icon: <RefreshCw    size={15}/> },
}

/* ── Order progress steps ── */
const STEPS: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'PENDING',    label: 'Sipariş Alındı',   icon: <Clock        size={16}/> },
  { status: 'PAID',       label: 'Ödeme Onaylandı',  icon: <CheckCircle2 size={16}/> },
  { status: 'PROCESSING', label: 'Hazırlanıyor',      icon: <Package      size={16}/> },
  { status: 'SHIPPED',    label: 'Kargoya Verildi',   icon: <Truck        size={16}/> },
  { status: 'DELIVERED',  label: 'Teslim Edildi',     icon: <CheckCircle2 size={16}/> },
]

const STATUS_STEP_INDEX: Record<OrderStatus, number> = {
  PENDING: 0, PAID: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4,
  CANCELLED: -1, REFUNDED: -1,
}

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD:      'Kredi / Banka Kartı',
  BANK_TRANSFER:    'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda Ödeme',
}

interface Props { params: Promise<{ id: string }> }

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
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
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
      <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
        <AlertCircle size={36} className="text-red-400 mx-auto mb-3" />
        <p className="font-bold text-gray-600">Sipariş bulunamadı</p>
        <Link href="/hesabim/siparislerim"
          className="text-orange text-sm hover:underline mt-2 block">
          Siparişlere dön
        </Link>
      </div>
    )
  }

  const status = STATUS_CONFIG[order.status]
  const stepIdx = STATUS_STEP_INDEX[order.status]
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'
  const canCancel = order.status === 'PENDING' || order.status === 'PAID'

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Link href="/hesabim/siparislerim"
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-orange hover:text-white
                     flex items-center justify-center transition-colors text-gray-500">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-lg font-extrabold text-navy-dark">
            Sipariş #{order.orderNumber}
          </h1>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
            {' — '}
            <span className={`font-semibold ${status.badge.includes('green') ? 'text-green-600' : ''}`}>
              {status.label}
            </span>
          </p>
        </div>

        {/* Status badge */}
        <div className={`ml-auto flex items-center gap-1.5 border rounded-xl px-3 py-1.5 text-sm
                         font-bold flex-shrink-0 ${status.badge}`}>
          {status.icon}
          {status.label}
        </div>
      </div>

      {/* ── Progress Timeline ── */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-extrabold text-navy-dark mb-5">Sipariş Durumu</h2>
          <div className="relative">
            {/* Track line — hidden on mobile, visible on sm+ */}
            <div className="hidden sm:block absolute top-5 left-5 right-5 h-0.5 bg-gray-100" />
            <div
              className="hidden sm:block absolute top-5 left-5 h-0.5 bg-orange transition-all duration-700"
              style={{ width: stepIdx >= 0 ? `${(stepIdx / (STEPS.length - 1)) * 90}%` : '0%' }}
            />

            <div className="relative flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
              {STEPS.map((step, i) => {
                const done    = i <= stepIdx
                const current = i === stepIdx
                return (
                  <div key={step.status} className="flex sm:flex-col flex-row items-center gap-2 sm:gap-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                    border-2 transition-all z-10 relative
                                    ${done
                                      ? current
                                        ? 'bg-orange border-orange text-white shadow-md shadow-orange/30'
                                        : 'bg-orange/10 border-orange text-orange'
                                      : 'bg-white border-gray-200 text-gray-300'}`}>
                      {step.icon}
                    </div>
                    <span className={`text-[10px] font-bold text-center leading-tight max-w-[60px]
                                      ${done ? (current ? 'text-orange' : 'text-navy-dark') : 'text-gray-300'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Cancelled notice ── */}
      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <XCircle size={20} className="text-red-500 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-700 text-sm">{status.label}</p>
            <p className="text-xs text-red-500 mt-0.5">
              Bu sipariş {order.status === 'REFUNDED' ? 'iade edildi' : 'iptal edildi'}.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* ── Products ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2 text-sm">
            <div className="w-6 h-6 bg-orange/10 rounded-lg flex items-center justify-center">
              <Package size={13} className="text-orange" />
            </div>
            Sipariş İçeriği
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id}
                className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy/5 to-orange/10
                                flex items-center justify-center flex-shrink-0 font-extrabold
                                text-navy-dark text-sm">
                  {item.productName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate leading-snug">
                    {item.productName}
                  </p>
                  {item.variantName && (
                    <p className="text-[11px] text-gray-400 mt-0.5">{item.variantName}</p>
                  )}
                  <p className="text-[11px] text-gray-400">×{item.quantity} adet</p>
                </div>
                <span className="text-sm font-extrabold text-navy-dark flex-shrink-0">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Ara Toplam</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-semibold">
                <span>İndirim {order.couponCode && `(${order.couponCode})`}</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Kargo</span>
              <span className={order.shippingCost === 0 ? 'text-green-600 font-semibold' : ''}>
                {order.shippingCost === 0 ? '🎉 Ücretsiz' : formatPrice(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between font-extrabold text-navy-dark pt-2
                            border-t border-gray-100 text-sm">
              <span>Toplam</span>
              <span className="text-orange">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Cancel button */}
          {canCancel && (
            <button
              onClick={() => {
                if (confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
                  cancelMutation.mutate()
                }
              }}
              disabled={cancelMutation.isPending}
              className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-red-500
                         font-semibold border border-red-200 rounded-xl py-2.5 hover:bg-red-50
                         transition-colors disabled:opacity-60"
            >
              {cancelMutation.isPending
                ? <><Loader2 size={13} className="animate-spin" /> İptal ediliyor…</>
                : <><XCircle size={14} /> Siparişi İptal Et</>}
            </button>
          )}
        </div>

        {/* ── Shipping & Payment ── */}
        <div className="space-y-4">
          {/* Delivery address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-orange/10 rounded-lg flex items-center justify-center">
                <MapPin size={13} className="text-orange" />
              </div>
              Teslimat Adresi
            </h2>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-gray-800">{order.shippingAddress.fullName}</p>
              <p className="text-xs text-gray-500">{order.shippingAddress.phone}</p>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed bg-gray-50 rounded-xl p-3">
                {order.shippingAddress.addressLine}
                <br />
                <span className="font-semibold">
                  {order.shippingAddress.district} / {order.shippingAddress.city}
                </span>
                {order.shippingAddress.postalCode && (
                  <> — {order.shippingAddress.postalCode}</>
                )}
              </p>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2 text-sm">
              <div className="w-6 h-6 bg-orange/10 rounded-lg flex items-center justify-center">
                <CreditCard size={13} className="text-orange" />
              </div>
              Ödeme Yöntemi
            </h2>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <CreditCard size={18} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700">
                {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
