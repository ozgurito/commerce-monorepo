'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ShoppingBag, Loader2, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
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

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Tüm Durumlar' },
  ...Object.entries(STATUS_CONFIG).map(([v, { label }]) => ({ value: v, label })),
]

export default function AdminSiparislerPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Durum güncellendi')
    },
    onError: () => toast.error('Güncelleme başarısız'),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter],
    queryFn: () => adminApi.getOrders(page, 20, statusFilter || undefined),
  })

  const orders = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Siparişler</h1>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none
                     focus:border-orange focus:ring-1 focus:ring-orange/20"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-orange animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Sipariş bulunamadı</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Sipariş No</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Müşteri</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tarih</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Tutar</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => {
                const status = STATUS_CONFIG[order.status]
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-semibold text-navy-dark">
                      #{order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.userEmail}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-navy-dark">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({ id: order.id, status: e.target.value as OrderStatus })
                        }
                        disabled={updateStatusMutation.isPending}
                        className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer
                                    focus:outline-none focus:ring-1 focus:ring-orange/30
                                    disabled:opacity-60 ${status.color}`}
                      >
                        {Object.entries(STATUS_CONFIG).map(([v, { label }]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="text-gray-400 hover:text-orange transition-colors"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors">
            Önceki
          </button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors">
            Sonraki
          </button>
        </div>
      )}
    </div>
  )
}
