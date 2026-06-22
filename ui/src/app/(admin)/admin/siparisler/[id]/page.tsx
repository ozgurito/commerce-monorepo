'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Loader2, Save, MapPin, Package,
  Truck, CreditCard, User, CheckCircle2, AlertCircle, Printer, FileText,
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
import type { OrderStatus } from '@/domains/orders/orders.types'

/* ── Durum konfigürasyonu ── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  PENDING:    { label: 'Beklemede',     color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  PAID:       { label: 'Ödendi',        color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200' },
  PROCESSING: { label: 'Hazırlanıyor',  color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200' },
  SHIPPED:    { label: 'Kargoda',       color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200' },
  DELIVERED:  { label: 'Teslim Edildi', color: 'text-green-700',   bg: 'bg-green-50 border-green-200' },
  CANCELLED:  { label: 'İptal Edildi',  color: 'text-red-700',     bg: 'bg-red-50 border-red-200' },
  REFUNDED:   { label: 'İade Edildi',   color: 'text-gray-600',    bg: 'bg-gray-50 border-gray-200' },
}

const ALL_STATUSES: OrderStatus[] = [
  'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED',
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD:      'Kredi / Banka Kartı',
  BANK_TRANSFER:    'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda Ödeme',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING:          'Bekliyor',
  PAID:             'Ödendi',
  FAILED:           'Başarısız',
  REFUNDED:         'İade Edildi',
  WAITING_TRANSFER: 'Havale Bekleniyor',
  WAITING_COD:      'Kapıda Ödeme',
}

/* ── Sipariş akışı: hangi durum hangi adımda ── */
const FLOW_STEPS: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

interface Props {
  params: Promise<{ id: string }>
}

export default function AdminSiparisDetayPage({ params }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [orderId, setOrderId] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [selectedCarrier, setSelectedCarrier] = useState('ARAS')
  const [labelLoading, setLabelLoading] = useState(false)
  const [invoiceLoading, setInvoiceLoading] = useState(false)

  useEffect(() => {
    params.then(({ id }) => setOrderId(Number(id)))
  }, [params])

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => adminApi.getOrder(orderId!),
    enabled: !!orderId,
  })

  // Durum değişince seçimi sıfırla
  useEffect(() => {
    if (order?.status) setSelectedStatus(order.status)
    if (order?.trackingNumber) setTrackingNumber(order.trackingNumber)
    if (order?.shippingCarrier) setSelectedCarrier(order.shippingCarrier)
  }, [order?.status, order?.trackingNumber, order?.shippingCarrier])

  const displayStatus: OrderStatus = selectedStatus ?? order?.status ?? 'PENDING'

  const trackingMutation = useMutation({
    mutationFn: ({ carrier, trackingNumber: tn }: { carrier: string; trackingNumber: string }) =>
      adminApi.assignTracking(orderId!, carrier, tn),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] })
      toast.success('Kargo bilgisi kaydedildi')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Kayıt başarısız')
    },
  })

  const handleDownloadInvoice = async () => {
    if (!orderId) return
    setInvoiceLoading(true)
    try {
      const blob = await adminApi.getInvoice(orderId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      toast.error('Fatura oluşturulamadı')
    } finally {
      setInvoiceLoading(false)
    }
  }

  const handleDownloadLabel = async () => {
    if (!orderId) return
    setLabelLoading(true)
    try {
      const blob = await adminApi.getShippingLabel(orderId)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      toast.error('Etiket oluşturulamadı')
    } finally {
      setLabelLoading(false)
    }
  }

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => adminApi.updateOrderStatus(orderId!, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      setSelectedStatus(updated.status)
      toast.success('Sipariş durumu güncellendi')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Güncelleme başarısız')
    },
  })

  if (isLoading || !orderId) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  if (!order) return <p className="text-gray-400 py-10">Sipariş bulunamadı</p>

  const currentCfg = STATUS_CONFIG[order.status]
  const flowIdx = FLOW_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'

  return (
    <div className="max-w-[900px] space-y-5">
      {/* Başlık */}
      <div className="flex items-start gap-3">
        <button onClick={() => router.back()}
          className="mt-1 text-gray-400 hover:text-orange transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-extrabold text-navy-dark font-mono">
              #{order.orderNumber}
            </h1>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${currentCfg.bg} ${currentCfg.color}`}>
              {currentCfg.label}
            </span>
            <button
              onClick={handleDownloadInvoice}
              disabled={invoiceLoading}
              className="flex items-center gap-1.5 text-xs font-bold text-navy-dark border border-gray-200
                         px-3 py-1.5 rounded-lg hover:border-orange hover:text-orange transition-colors disabled:opacity-50 ml-auto"
            >
              {invoiceLoading
                ? <Loader2 size={12} className="animate-spin" />
                : <FileText size={12} />}
              Fatura İndir
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
            <User size={11} />
            {order.userEmail}
            <span className="text-gray-300">·</span>
            {new Date(order.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
            {' '}
            {new Date(order.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Sipariş İlerleme Çubuğu */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between relative">
            {/* Bağlantı çizgisi */}
            <div className="absolute left-0 right-0 top-4 h-0.5 bg-gray-100 mx-10 z-0" />
            <div
              className="absolute left-0 top-4 h-0.5 bg-orange z-0 transition-all duration-500"
              style={{
                marginLeft: '2.5rem',
                width: flowIdx < 0 ? '0%' : `${(flowIdx / (FLOW_STEPS.length - 1)) * (100 - (100 / FLOW_STEPS.length))}%`
              }}
            />
            {FLOW_STEPS.map((step, i) => {
              const done = flowIdx >= i
              const active = flowIdx === i
              return (
                <div key={step} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${done ? 'bg-orange' : 'bg-gray-100'}
                    ${active ? 'ring-4 ring-orange/20' : ''}`}>
                    {done
                      ? <CheckCircle2 size={16} className="text-white" />
                      : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                  </div>
                  <span className={`text-[10px] font-semibold text-center leading-tight
                    ${done ? 'text-orange' : 'text-gray-400'}`}>
                    {STATUS_CONFIG[step].label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm font-semibold text-red-600">
            Bu sipariş {currentCfg.label.toLowerCase()} — işlem yapılamaz.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sol: Ürünler (2/3 genişlik) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Durum Güncelle */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-extrabold text-navy-dark mb-3 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange/10 rounded-md flex items-center justify-center">
                <CheckCircle2 size={12} className="text-orange" />
              </div>
              Durum Güncelle
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={displayStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold
                           focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20
                           bg-white"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
              <button
                onClick={() => statusMutation.mutate(displayStatus)}
                disabled={statusMutation.isPending || displayStatus === order.status}
                className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                           font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50
                           text-sm whitespace-nowrap"
              >
                {statusMutation.isPending
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Save size={14} />}
                Güncelle
              </button>
            </div>
            {/* Ödeme bilgisi */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl px-3 py-2 flex items-center gap-2">
                <CreditCard size={13} className="text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Ödeme</p>
                  <p className="text-xs font-bold text-gray-700">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod ?? '—'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Ödeme Durumu</p>
                <p className="text-xs font-bold text-gray-700">
                  {PAYMENT_STATUS_LABELS[order.paymentStatus ?? ''] ?? order.paymentStatus ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Kargo Takip */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold text-navy-dark flex items-center gap-2">
                <div className="w-5 h-5 bg-orange/10 rounded-md flex items-center justify-center">
                  <Truck size={12} className="text-orange" />
                </div>
                Kargo Takip
              </h2>
              <button
                onClick={handleDownloadLabel}
                disabled={labelLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-orange border border-orange
                           px-3 py-1.5 rounded-lg hover:bg-orange/5 transition-colors disabled:opacity-50"
              >
                {labelLoading
                  ? <Loader2 size={12} className="animate-spin" />
                  : <Printer size={12} />}
                Kargo Etiketi
              </button>
            </div>
            <div className="space-y-2">
              <select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold
                           focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20 bg-white"
              >
                <option value="ARAS">Aras Kargo</option>
                <option value="YURTICI">Yurtiçi Kargo</option>
                <option value="MNG">MNG Kargo</option>
                <option value="PTT">PTT Kargo</option>
              </select>
              <div className="flex items-center gap-3">
                <input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Takip numarası girin…"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20"
                />
                <button
                  onClick={() => {
                    if (!trackingNumber.trim()) { toast.error('Takip numarası girin'); return }
                    trackingMutation.mutate({ carrier: selectedCarrier, trackingNumber })
                  }}
                  disabled={trackingMutation.isPending}
                  className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                             font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap
                             disabled:opacity-50"
                >
                  {trackingMutation.isPending
                    ? <Loader2 size={14} className="animate-spin" />
                    : <Save size={14} />}
                  Kaydet
                </button>
              </div>
              {order.trackingNumber && (
                <p className="text-xs text-gray-400">
                  Mevcut: <span className="font-mono font-bold text-gray-600">{order.trackingNumber}</span>
                  {' '}({order.shippingCarrier})
                </p>
              )}
            </div>
          </div>

          {/* Ürünler */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-extrabold text-navy-dark mb-4 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange/10 rounded-md flex items-center justify-center">
                <Package size={12} className="text-orange" />
              </div>
              Sipariş İçeriği ({order.items.length} ürün)
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  {/* Görsel */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-navy-dark to-navy-light
                                      flex items-center justify-center text-white font-extrabold text-lg">
                        {item.productName.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Detaylar */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{item.productName}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {item.color && (
                        <span className="text-[11px] font-semibold bg-white border border-gray-200
                                         text-gray-600 px-2 py-0.5 rounded-full">
                          {item.color}
                        </span>
                      )}
                      {item.size && (
                        <span className="text-[11px] font-bold bg-navy-dark text-white
                                         px-2 py-0.5 rounded-full">
                          {item.size}
                        </span>
                      )}
                      {!item.color && !item.size && item.variantName && (
                        <span className="text-[11px] text-gray-500 font-semibold">{item.variantName}</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatPrice(item.unitPrice)} × {item.quantity} adet
                    </p>
                  </div>

                  {/* Fiyat */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-extrabold text-navy-dark">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Özet */}
            <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Ara Toplam</span>
                <span className="font-semibold">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>İndirim {order.couponCode && `(${order.couponCode})`}</span>
                  <span className="font-bold">-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span>Kargo</span>
                <span className={`font-semibold ${order.shippingCost === 0 ? 'text-green-600' : ''}`}>
                  {order.shippingCost === 0 ? '🎁 Ücretsiz' : formatPrice(order.shippingCost)}
                </span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>KDV (%20)</span>
                  <span className="font-semibold">{formatPrice(order.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-navy-dark pt-1 border-t border-gray-100">
                <span>Toplam</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Müşteri + Teslimat */}
        <div className="space-y-5">
          {/* Müşteri */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-extrabold text-navy-dark mb-3 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange/10 rounded-md flex items-center justify-center">
                <User size={12} className="text-orange" />
              </div>
              Müşteri
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center
                              text-orange font-extrabold text-sm flex-shrink-0">
                {(order.userEmail ?? 'U').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{order.userEmail}</p>
                <p className="text-[11px] text-gray-400">ID: #{order.userId}</p>
              </div>
            </div>
          </div>

          {/* Teslimat Adresi */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-extrabold text-navy-dark mb-3 flex items-center gap-2">
              <div className="w-5 h-5 bg-orange/10 rounded-md flex items-center justify-center">
                <MapPin size={12} className="text-orange" />
              </div>
              Teslimat Adresi
            </h2>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-gray-800">{order.shippingAddress.fullName}</p>
              <p className="text-gray-500 text-xs font-semibold">{order.shippingAddress.phone}</p>
              <p className="text-gray-600 text-xs mt-2 leading-relaxed">
                {order.shippingAddress.addressLine}
              </p>
              <p className="text-gray-500 text-xs font-semibold">
                {order.shippingAddress.district} / {order.shippingAddress.city}
                {order.shippingAddress.postalCode && ` — ${order.shippingAddress.postalCode}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
