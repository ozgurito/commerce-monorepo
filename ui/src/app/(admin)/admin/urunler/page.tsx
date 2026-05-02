'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit2, Trash2, Loader2, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
import { useDebounce } from '@/hooks/useDebounce'

export default function AdminUrunlerPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, debouncedKeyword],
    queryFn: () => adminApi.getProducts(page, 20, debouncedKeyword || undefined),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Ürün silindi')
    },
    onError: () => toast.error('Ürün silinemedi'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: Record<string, boolean> }) =>
      adminApi.updateProduct(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
    onError: () => toast.error('Güncelleme başarısız'),
  })

  const products = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Ürünler</h1>
        <Link
          href="/admin/urunler/yeni"
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                     font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Yeni Ürün
        </Link>
      </div>

      {/* Arama */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={keyword}
          onChange={(e) => { setKeyword(e.target.value); setPage(0) }}
          placeholder="Ürün ara…"
          className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm
                     focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20"
        />
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-orange animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Ürün bulunamadı</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Ürün</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">SKU</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fiyat</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Stok</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aktif</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Öne Çıkan</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? (
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                          <Image
                            src={p.imageUrl}
                            alt={p.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center
                                        flex-shrink-0 text-sm font-bold text-orange">
                          {p.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-navy-dark truncate max-w-[200px]">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.categoryName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy-dark">
                    {formatPrice(p.price)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.active}
                      onChange={() => toggleMutation.mutate({ id: p.id, patch: { isActive: !p.active } })}
                      disabled={toggleMutation.isPending}
                      className="w-4 h-4 accent-orange cursor-pointer disabled:cursor-default"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={p.featured}
                      onChange={() => toggleMutation.mutate({ id: p.id, patch: { featured: !p.featured } })}
                      disabled={toggleMutation.isPending}
                      className="w-4 h-4 accent-orange cursor-pointer disabled:cursor-default"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/admin/urunler/${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-navy-dark hover:bg-gray-100
                                   rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </Link>
                      <button
                        onClick={() => {
                          if (confirm(`"${p.name}" silinsin mi?`)) deleteMutation.mutate(p.id)
                        }}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                                   rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sayfalama */}
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
