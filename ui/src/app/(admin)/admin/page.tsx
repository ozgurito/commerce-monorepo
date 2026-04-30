'use client'
import { useQuery } from '@tanstack/react-query'
import {
  ShoppingBag, Package, Users, Star, TrendingUp,
  AlertTriangle, Clock, Loader2,
} from 'lucide-react'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sipariş durumu */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-bold text-navy-dark mb-4 flex items-center gap-2">
            <ShoppingBag size={16} className="text-orange" /> Sipariş Durumu
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Beklemede',    val: stats?.pendingOrders ?? 0,    color: 'bg-yellow-400' },
              { label: 'Hazırlanıyor', val: stats?.processingOrders ?? 0, color: 'bg-purple-400' },
              { label: 'Tamamlandı',   val: stats?.completedOrders ?? 0,  color: 'bg-green-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-sm text-gray-600 flex-1">{label}</span>
                <span className="font-bold text-navy-dark">{val}</span>
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
                  <span className="font-bold text-red-500 ml-2 flex-shrink-0">
                    {item.currentStock} adet
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Yorumlar özeti */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-navy-dark mb-3 flex items-center gap-2">
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
    </div>
  )
}
