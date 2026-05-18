'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag, Package, Users, Star, TrendingUp,
  AlertTriangle, Clock, Loader2, BarChart2, ExternalLink,
} from 'lucide-react'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { MonthlyStatDto } from '@/domains/admin/admin.types'

/* ── Türkçe ay kısaltmaları ── */
const TR_MONTHS_SHORT = ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

/* ── Son 7 ayı üret (geriye dönük dolgu için) ── */
function buildMonthSlots(): { year: number; month: number }[] {
  const slots = []
  const now = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    slots.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return slots
}

function RevenueChart({ data }: { data: MonthlyStatDto[] }) {
  const slots = buildMonthSlots()

  // Veriyi slot'larla birleştir (eksik ayları 0 ile doldur)
  const mapped = slots.map(slot => {
    const found = data.find(d => d.year === slot.year && d.month === slot.month)
    return {
      label: TR_MONTHS_SHORT[slot.month],
      revenue: found?.revenue ?? 0,
      orders: found?.orderCount ?? 0,
    }
  })

  const maxRevenue = Math.max(...mapped.map(m => m.revenue), 1)
  const chartH = 140
  const barW = 28
  const gap = 16
  const totalW = mapped.length * (barW + gap) - gap
  const padL = 48
  const padB = 24
  const svgW = totalW + padL + 20
  const svgH = chartH + padB + 20

  // Y ekseni işaretleri (3 adet)
  const yTicks = [0, 0.5, 1].map(pct => ({
    val: maxRevenue * pct,
    y: chartH - chartH * pct + 8,
  }))

  return (
    <div>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="w-full overflow-visible"
        style={{ height: svgH }}
      >
        {/* Y ekseni grid + label */}
        {yTicks.map(({ val, y }) => (
          <g key={y}>
            <line x1={padL} y1={y} x2={svgW - 10} y2={y}
              stroke="#f3f4f6" strokeWidth="1" />
            <text x={padL - 6} y={y + 4} textAnchor="end"
              fontSize="9" fill="#9ca3af">
              {val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Çubuklar + X etiketleri */}
        {mapped.map((m, i) => {
          const x = padL + i * (barW + gap)
          const barH = Math.max(2, (m.revenue / maxRevenue) * chartH)
          const barY = chartH - barH + 8
          const isLast = i === mapped.length - 1

          return (
            <g key={i}>
              {/* Bar gölgesi */}
              <rect
                x={x + 2} y={barY + 3} width={barW} height={barH}
                rx="4" fill="rgba(0,0,0,0.06)"
              />
              {/* Ana bar — son ay turuncu, diğerleri lacivert */}
              <rect
                x={x} y={barY} width={barW} height={barH}
                rx="4"
                fill={isLast ? '#f97316' : '#1e3a5f'}
                opacity={isLast ? 1 : 0.65}
              />
              {/* Üst değer etiketi */}
              {m.revenue > 0 && (
                <text
                  x={x + barW / 2} y={barY - 5}
                  textAnchor="middle" fontSize="8.5" fontWeight="700"
                  fill={isLast ? '#f97316' : '#374151'}
                >
                  {m.revenue >= 1000 ? `${(m.revenue / 1000).toFixed(1)}K` : m.revenue.toFixed(0)}
                </text>
              )}
              {/* X etiketi */}
              <text
                x={x + barW / 2} y={svgH - 4}
                textAnchor="middle" fontSize="9"
                fill={isLast ? '#f97316' : '#6b7280'}
                fontWeight={isLast ? '700' : '400'}
              >
                {m.label}
              </text>
            </g>
          )
        })}

        {/* Y ekseni çizgisi */}
        <line x1={padL} y1={8} x2={padL} y2={chartH + 8}
          stroke="#e5e7eb" strokeWidth="1" />
      </svg>

      {/* Sipariş sayıları — alt satır */}
      <div className="flex gap-0 mt-1" style={{ paddingLeft: padL }}>
        {mapped.map((m, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center flex-1"
            style={{ maxWidth: barW + gap }}
          >
            <span className={`text-[10px] font-bold ${i === mapped.length - 1 ? 'text-orange' : 'text-gray-400'}`}>
              {m.orders > 0 ? `${m.orders} sip.` : '—'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({
  label, value, icon: Icon, color, sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-navy-dark">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: QUERY_KEYS.admin.stats,
    queryFn: adminApi.getStats,
    staleTime: 60 * 1000,
  })

  const { data: lowStock = [] } = useQuery({
    queryKey: QUERY_KEYS.admin.lowStock,
    queryFn: adminApi.getLowStock,
    staleTime: 5 * 60 * 1000,
  })

  const { data: monthlyStats = [], isLoading: chartLoading } = useQuery({
    queryKey: QUERY_KEYS.admin.monthlyStats,
    queryFn: adminApi.getMonthlyStats,
    staleTime: 5 * 60 * 1000,
  })

  const { data: recentOrdersData } = useQuery({
    queryKey: [...QUERY_KEYS.admin.orders, 'recent'],
    queryFn: () => adminApi.getOrders(0, 5),
    staleTime: 60 * 1000,
  })
  const recentOrders = recentOrdersData?.content ?? []

  if (statsLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold text-navy-dark">Dashboard</h1>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Toplam Sipariş" value={stats?.totalOrders ?? 0}
          icon={ShoppingBag} color="bg-blue-500"
          sub={`${stats?.pendingOrders ?? 0} beklemede`}
        />
        <StatCard
          label="Toplam Gelir" value={formatPrice(stats?.totalRevenue ?? 0)}
          icon={TrendingUp} color="bg-green-500"
          sub={`Ort. ${formatPrice(stats?.averageOrderValue ?? 0)}`}
        />
        <StatCard
          label="Ürünler" value={stats?.totalProducts ?? 0}
          icon={Package} color="bg-purple-500"
          sub={`${stats?.activeProducts ?? 0} aktif`}
        />
        <StatCard
          label="Kullanıcılar" value={stats?.totalUsers ?? 0}
          icon={Users} color="bg-orange"
        />
      </div>

      {/* ── GELİR GRAFİĞİ ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-navy-dark flex items-center gap-2">
            <BarChart2 size={16} className="text-orange" />
            Aylık Gelir (Son 7 Ay)
          </h2>
          {monthlyStats.length > 0 && (
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-navy-dark/65 inline-block" />
                Önceki aylar
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange inline-block" />
                Bu ay
              </span>
            </div>
          )}
        </div>

        {chartLoading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 size={20} className="text-orange animate-spin" />
          </div>
        ) : monthlyStats.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center gap-2 text-gray-400">
            <BarChart2 size={32} strokeWidth={1.2} />
            <p className="text-sm">Henüz sipariş verisi yok</p>
          </div>
        ) : (
          <RevenueChart data={monthlyStats} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sipariş durumu */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-orange" /> Sipariş Durumu
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Beklemede',    val: stats?.pendingOrders ?? 0,    color: 'bg-yellow-400', pct: stats?.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0 },
              { label: 'Hazırlanıyor', val: stats?.processingOrders ?? 0, color: 'bg-purple-400', pct: stats?.totalOrders ? (stats.processingOrders / stats.totalOrders) * 100 : 0 },
              { label: 'Tamamlandı',   val: stats?.completedOrders ?? 0,  color: 'bg-green-400',  pct: stats?.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0 },
            ].map(({ label, val, color, pct }) => (
              <div key={label}>
                <div className="flex items-center gap-3 mb-1">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
                  <span className="text-sm text-gray-600 flex-1">{label}</span>
                  <span className="font-bold text-navy-dark">{val}</span>
                </div>
                <div className="ml-5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Düşük stok uyarısı */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-orange" />
            Düşük Stok
            {lowStock.length > 0 && (
              <span className="ml-auto text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
                {lowStock.length}
              </span>
            )}
          </h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">Stok sorunu yok ✓</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {lowStock.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 truncate flex-1">{item.productName}</span>
                  <span className={`font-bold ml-2 flex-shrink-0 ${item.currentStock <= 3 ? 'text-red-500' : 'text-orange'}`}>
                    {item.currentStock} adet
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Yorumlar + Son Siparişler — yan yana */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Yorumlar özeti */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <Star size={16} className="text-orange" /> Yorumlar
          </h2>
          <div className="flex items-center gap-8">
            <div>
              <p className="text-2xl font-extrabold text-navy-dark">{stats?.totalReviews ?? 0}</p>
              <p className="text-xs text-gray-400">Toplam yorum</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-orange">{stats?.pendingReviews ?? 0}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={11} /> Onay bekliyor
              </p>
            </div>
          </div>
        </div>

        {/* Son Siparişler */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-navy-dark flex items-center gap-2">
              <ShoppingBag size={16} className="text-orange" /> Son Siparişler
            </h2>
            <Link href="/admin/siparisler"
              className="flex items-center gap-1 text-xs text-orange hover:underline font-semibold">
              Tümü <ExternalLink size={11} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz sipariş yok</p>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const statusColors: Record<string, string> = {
                  PENDING:    'bg-yellow-100 text-yellow-700',
                  PROCESSING: 'bg-purple-100 text-purple-700',
                  SHIPPED:    'bg-blue-100 text-blue-700',
                  DELIVERED:  'bg-green-100 text-green-700',
                  CANCELLED:  'bg-red-100 text-red-600',
                  REFUNDED:   'bg-gray-100 text-gray-600',
                }
                const statusLabels: Record<string, string> = {
                  PENDING: 'Beklemede', PROCESSING: 'Hazırlanıyor',
                  SHIPPED: 'Kargoda', DELIVERED: 'Teslim',
                  CANCELLED: 'İptal', REFUNDED: 'İade',
                }
                return (
                  <Link
                    key={order.id}
                    href={`/admin/siparisler/${order.id}`}
                    className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-navy-dark truncate">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 truncate">{order.userEmail}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
                      ${statusColors[order.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                    <span className="text-sm font-extrabold text-orange flex-shrink-0">
                      {formatPrice(order.total)}
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
