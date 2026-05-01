'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Package, ChevronRight, Loader2, ShoppingBag,
  Clock, CheckCircle2, Truck, XCircle, RefreshCw,
} from 'lucide-react'
import { ordersApi } from '@/domains/orders/orders.api'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { OrderStatus } from '@/domains/orders/orders.types'

type StatusCfg = {
  label: string
  color: string
  bg: string
  icon: React.ReactNode
  dot: string
}

const STATUS_CONFIG: Record<OrderStatus, StatusCfg> = {
  PENDING:    { label: 'Beklemede',     color: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200',  dot: 'bg-amber-400',  icon: <Clock        size={13} /> },
  PAID:       { label: 'Ödendi',        color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200',   dot: 'bg-blue-400',   icon: <CheckCircle2 size={13} /> },
  PROCESSING: { label: 'Hazırlanıyor',  color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-400', icon: <Package      size={13} /> },
  SHIPPED:    { label: 'Kargoda',       color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', dot: 'bg-indigo-400', icon: <Truck        size={13} /> },
  DELIVERED:  { label: 'Teslim Edildi', color: 'text-green-700',  bg: 'bg-green-50  border-green-200',  dot: 'bg-green-400',  icon: <CheckCircle2 size={13} /> },
  CANCELLED:  { label: 'İptal Edildi',  color: 'text-red-700',    bg: 'bg-red-50    border-red-200',    dot: 'bg-red-400',    icon: <XCircle      size={13} /> },
  REFUNDED:   { label: 'İade Edildi',   color: 'text-gray-600',   bg: 'bg-gray-50   border-gray-200',   dot: 'bg-gray-400',   icon: <RefreshCw    size={13} /> },
}

const PAGE_SIZE = 10

export default function SiparislerimPage() {
  const [page, setPage] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: [...QUERY_KEYS.orders.all, page],
    queryFn: () => ordersApi.list(page, PAGE_SIZE),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  const orders = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-navy-dark">Siparişlerim</h1>
          {orders.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{data?.totalElements ?? orders.length} sipariş</p>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <div className="w-20 h-20 bg-orange/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={32} className="text-orange/40" />
          </div>
          <p className="font-bold text-gray-600 mb-1">Henüz siparişiniz yok</p>
          <p className="text-sm text-gray-400 mb-6">İlk alışverişinizi yaparak başlayın!</p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-6 py-3 rounded-xl transition-colors text-sm
                       shadow-md shadow-orange/20"
          >
            <ShoppingBag size={16} />
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const st = STATUS_CONFIG[order.status]
            return (
              <Link
                key={order.id}
                href={`/hesabim/siparislerim/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-100 overflow-hidden
                           hover:border-orange/30 hover:shadow-[0_4px_20px_rgba(0,0,0,.08)]
                           transition-all group"
              >
                {/* Top bar colored accent */}
                <div className={`h-1 ${st.dot}`} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-orange/8 rounded-xl flex items-center
                                      justify-center flex-shrink-0">
                        <Package size={20} className="text-orange" />
                      </div>
                      <div>
                        <p className="font-extrabold text-navy-dark text-sm">
                          Sipariş #{order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
                        </p>
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold
                                        px-2.5 py-1.5 rounded-full border ${st.bg} ${st.color}`}>
                        {st.icon}
                        {st.label}
                      </span>
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-orange
                                                          transition-colors" />
                    </div>
                  </div>

                  {/* Items preview */}
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center
                                  justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 truncate">
                        {(order.items ?? []).slice(0, 2).map(i => i.productName).join(', ')}
                        {(order.items?.length ?? 0) > 2 && ` +${(order.items?.length ?? 0) - 2} ürün daha`}
                      </p>
                    </div>
                    <p className="font-extrabold text-navy-dark text-sm flex-shrink-0">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors"
          >
            ← Önceki
          </button>
          <span className="text-sm text-gray-500 px-2">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors"
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  )
}
