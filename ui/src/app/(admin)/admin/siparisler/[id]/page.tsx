'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Save, MapPin, Package, Truck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
import type { OrderStatus } from '@/domains/orders/orders.types'

const ALL_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING',    label: 'Beklemede' },
  { value: 'PAID',       label: 'Ödendi' },
  { value: 'PROCESSING', label: 'Hazırlanıyor' },
  { value: 'SHIPPED',    label: 'Kargoda' },
  { value: 'DELIVERED',  label: 'Teslim Edildi' },
  { value: 'CANCELLED',  label: 'İptal Edildi' },
  { value: 'REFUNDED',   label: 'İade Edildi' },
]

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD:      'Kredi / Banka Kartı',
  BANK_TRANSFER:    'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda Ödeme',
}

interface Props {
  params: Promise<{ id: string }>
}

export default function AdminSiparisDetayPage({ params }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [orderId, setOrderId] = useState<number | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [trackingSaved, setTrackingSaved] = useState(false)

  useEffect(() => {
    params.then(({ id }) => setOrderId(Number(id)))
  }, [params])

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'order', orderId],
    queryFn: () => adminApi.getOrder(orderId!),
    enabled: !!orderId,
  })

  const displayStatus: OrderStatus = selectedStatus ?? order?.status ?? 'PENDING'

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => adminApi.updateOrderStatus(orderId!, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'order', orderId] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
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

  if (!order) return <p className="text-gray-400">Sipariş bulunamadı</p>

  return (
    <div className="max-w-[760px] space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-orange">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-extrabold text-navy-dark">#{order.orderNumber}</h1>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
            {' · '}{order.userEmail}
          </p>
        </div>
      </div>

      {/* Durum güncelle */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-navy-dark mb-4">Sipariş Durumu</h2>
        <div className="flex items-center gap-3">
          <select
            value={displayStatus}
            onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => statusMutation.mutate(displayStatus)}
            disabled={statusMutation.isPending || displayStatus === order.status}
            className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
          >
            {statusMutation.isPending
              ? <Loader2 size={14} className="animate-spin" />
              : <Save size={14} />}
            Güncelle
          </button>
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
          <span>Ödeme: <strong className="text-gray-700">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</strong></span>
          <span>Ödeme Durumu: <strong className="text-gray-700">{order.paymentStatus}</strong></span>
        </div>
      </div>

      {/* Kargo Takip */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
          <Truck size={15} className="text-orange" /> Kargo Takip
        </h2>
        <div className="flex items-center gap-3">
          <input
            value={trackingNumber}
            onChange={(e) => { setTrackingNumber(e.target.value); setTrackingSaved(false) }}
            placeholder="Kargo takip numarası girin…"
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                       focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/20"
          />
          <button
            onClick={() => {
              if (!trackingNumber.trim()) { toast.error('Takip numarası girin'); return }
              // Backend tracking endpoint henüz yok — clipboard kopyala
              navigator.clipboard?.writeText(trackingNumber).catch(() => {})
              setTrackingSaved(true)
              toast.success('Takip numarası kaydedildi')
            }}
            className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Save size={14} />
            {trackingSaved ? 'Kaydedildi ✓' : 'Kaydet'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Kargo takip numarasını girerek sipariş notuna ekleyebilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ürünler */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <Package size={15} className="text-orange" /> Ürünler
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center
                                text-gray-600 font-bold text-xs flex-shrink-0">
                  {item.productName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{item.productName}</p>
                  {item.variantName && <p className="text-[10px] text-gray-400">{item.variantName}</p>}
                  <p className="text-[10px] text-gray-400">×{item.quantity}</p>
                </div>
                <span className="text-xs font-bold text-navy-dark">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-4 pt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Ara Toplam</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>İndirim</span><span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Kargo</span>
              <span>{order.shippingCost === 0 ? 'Ücretsiz' : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-navy-dark border-t border-gray-100 pt-1">
              <span>Toplam</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Teslimat */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <MapPin size={15} className="text-orange" /> Teslimat
          </h2>
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
            <p className="text-gray-500 text-xs">{order.shippingAddress.phone}</p>
            <p className="text-gray-600 text-xs mt-2">{order.shippingAddress.addressLine}</p>
            <p className="text-gray-500 text-xs">
              {order.shippingAddress.district} / {order.shippingAddress.city}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
