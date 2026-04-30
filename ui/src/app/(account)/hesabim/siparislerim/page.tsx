'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'
import { ordersApi } from '@/domains/orders/orders.api'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { OrderStatus } from '@/domains/orders/orders.types'

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string }> = {
  PENDING:    { label: 'Beklemede',     color: 'bg-yellow-100 text-yellow-700' },
  PAID:       { label: 'Ödendi',        color: 'bg-blue-100 text-blue-700' },
  PROCESSING: { label: 'Hazırlanıyor',  color: 'bg-purple-100 text-purple-700' },
  SHIPPED:    { label: 'Kargoda',       color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED:  { label: 'Teslim Edildi', color: 'bg-green-100 text-green-700' },
  CANCELLED:  { label: 'İptal Edildi',  color: 'bg-red-100 text-red-700' },
  REFUNDED:   { label: 'İade Edildi',   color: 'bg-gray-100 text-gray-600' },
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
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-dark">Siparişlerim</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-500 mb-1">Henüz siparişiniz yok</p>
          <p className="text-sm text-gray-400 mb-6">Alışverişe başlamak ister misiniz?</p>
          <Link
            href="/urunler"
            className="inline-block bg-orange hover:bg-orange-dark text-white font-bold
                       px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const status = STATUS_CONFIG[order.status]
            return (
              <Link
                key={order.id}
                href={`/hesabim/siparislerim/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5
                           hover:border-orange/30 hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={18} className="text-orange" />
                    </div>
                    <div>
                      <p className="font-bold text-navy-dark text-sm">
                        #{order.orderNumber}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
                        {' · '}{order.items.length} ürün
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="font-extrabold text-navy-dark">{formatPrice(order.total)}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Sayfalama */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors"
          >
            Önceki
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
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
