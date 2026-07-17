'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Search, Edit2, Trash2, Loader2, Package,
  FileSpreadsheet, AlertTriangle, ChevronDown, ChevronRight,
  Layers, Tag,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import { formatPrice } from '@/utils/format'
import { useDebounce } from '@/hooks/useDebounce'
import type { ProductDto } from '@/domains/products/products.types'

/* ─── View modes ─── */
type ViewMode = 'flat' | 'grouped'

/* ─── Inline variant row ─── */
function VariantRows({ productId }: { productId: number }) {
  const { data: variants = [], isLoading } = useQuery({
    queryKey: ['admin', 'variants', productId],
    queryFn: () => adminApi.getVariants(productId),
  })

  if (isLoading) {
    return (
      <tr>
        <td colSpan={7} className="px-5 py-3 bg-orange/5">
          <div className="flex items-center gap-2 text-xs text-gray-400 pl-14">
            <Loader2 size={12} className="animate-spin" /> Varyantlar yükleniyor…
          </div>
        </td>
      </tr>
    )
  }

  if (variants.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="px-5 py-2 bg-gray-50">
          <p className="text-xs text-gray-400 pl-14">Varyant yok</p>
        </td>
      </tr>
    )
  }

  const colors = variants.filter(v => v.variantType === 'COLOR')
  const sizes  = variants.filter(v => v.variantType === 'SIZE')

  return (
    <tr>
      <td colSpan={7} className="bg-orange/5 border-t border-orange/10">
        <div className="pl-14 pr-4 py-2.5 flex flex-wrap gap-3">
          {colors.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Renk:</span>
              {colors.map(v => (
                <span key={v.id} className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-lg px-2 py-0.5">
                  {v.colorHex && (
                    <span className="w-3 h-3 rounded-full inline-block border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: v.colorHex }} />
                  )}
                  {v.color ?? v.name}
                  <span className="text-gray-400 text-[10px]">({v.stock})</span>
                </span>
              ))}
            </div>
          )}
          {sizes.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Beden:</span>
              {sizes.map(v => (
                <span key={v.id} className="text-xs bg-white border border-gray-200 rounded-lg px-2 py-0.5">
                  {v.size ?? v.name}
                  <span className="text-gray-400 text-[10px] ml-1">({v.stock})</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ─── Single product row ─── */
function ProductRow({
  p,
  expanded,
  onToggleExpand,
  onDelete,
  onToggle,
  deleteIsPending,
  toggleIsPending,
}: {
  p: ProductDto
  expanded: boolean
  onToggleExpand: () => void
  onDelete: (id: number, name: string) => void
  onToggle: (id: number, patch: Record<string, boolean>) => void
  deleteIsPending: boolean
  toggleIsPending: boolean
}) {
  return (
    <>
      <tr
        className="hover:bg-gray-50 transition-colors cursor-pointer select-none"
        onClick={onToggleExpand}
      >
        {/* Expand chevron + product */}
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-gray-300 flex-shrink-0">
              {expanded
                ? <ChevronDown size={14} className="text-orange" />
                : <ChevronRight size={14} />}
            </span>
            <div className="flex items-center gap-3">
              {p.imageUrl ? (
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                  <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center
                                flex-shrink-0 text-sm font-bold text-orange">
                  {p.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-navy-dark truncate max-w-[200px]" title={p.name}>{p.name}</p>
                <p className="text-xs text-gray-400">{p.categoryName}</p>
              </div>
            </div>
          </div>
        </td>

        {/* Model Kodu */}
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          {p.sku ? (
            <span className="inline-block font-mono text-[11px] font-semibold text-navy-dark
                             bg-navy-dark/5 border border-navy-dark/10 rounded-lg px-2 py-0.5
                             max-w-[130px] truncate" title={p.sku}>
              {p.sku}
            </span>
          ) : (
            <span className="text-gray-300 text-xs">—</span>
          )}
        </td>

        {/* Price */}
        <td className="px-4 py-3 text-right font-bold text-navy-dark" onClick={e => e.stopPropagation()}>
          {formatPrice(p.price)}
        </td>

        {/* Stock */}
        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
          <span className={`font-bold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-700'}`}>
            {p.stock}
          </span>
        </td>

        {/* Active toggle */}
        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={p.active}
            onChange={() => onToggle(p.id, { isActive: !p.active })}
            disabled={toggleIsPending}
            className="w-4 h-4 accent-orange cursor-pointer disabled:cursor-default"
          />
        </td>

        {/* Featured toggle */}
        <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={p.featured}
            onChange={() => onToggle(p.id, { isFeatured: !p.featured })}
            disabled={toggleIsPending}
            className="w-4 h-4 accent-orange cursor-pointer disabled:cursor-default"
          />
        </td>

        {/* Actions */}
        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 justify-end">
            <Link
              href={`/admin/urunler/${p.id}`}
              className="p-1.5 text-gray-400 hover:text-navy-dark hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 size={14} />
            </Link>
            <button
              onClick={() => onDelete(p.id, p.name)}
              disabled={deleteIsPending}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                         rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Expanded variant rows */}
      {expanded && <VariantRows productId={p.id} />}
    </>
  )
}

/* ─── Category group section ─── */
function CategoryGroup({
  categoryName,
  products,
  expandedIds,
  onToggleExpand,
  onDelete,
  onToggle,
  deleteIsPending,
  toggleIsPending,
}: {
  categoryName: string
  products: ProductDto[]
  expandedIds: Set<number>
  onToggleExpand: (id: number) => void
  onDelete: (id: number, name: string) => void
  onToggle: (id: number, patch: Record<string, boolean>) => void
  deleteIsPending: boolean
  toggleIsPending: boolean
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Category header row */}
      <tr
        className="bg-gray-50 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
      >
        <td colSpan={7} className="px-5 py-2">
          <div className="flex items-center gap-2">
            {collapsed
              ? <ChevronRight size={14} className="text-gray-400" />
              : <ChevronDown size={14} className="text-gray-400" />}
            <Tag size={13} className="text-orange" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{categoryName}</span>
            <span className="ml-1 text-[10px] text-gray-400 bg-gray-200 rounded-full px-2 py-0.5 font-semibold">
              {products.length}
            </span>
          </div>
        </td>
      </tr>

      {!collapsed && products.map(p => (
        <ProductRow
          key={p.id}
          p={p}
          expanded={expandedIds.has(p.id)}
          onToggleExpand={() => onToggleExpand(p.id)}
          onDelete={onDelete}
          onToggle={onToggle}
          deleteIsPending={deleteIsPending}
          toggleIsPending={toggleIsPending}
        />
      ))}
    </>
  )
}

/* ─── Main page ─── */
export default function AdminUrunlerPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [keyword, setKeyword] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grouped')
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)

  const debouncedKeyword = useDebounce(keyword, 400)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })

  // Düz liste — sayfalı
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, debouncedKeyword, categoryId],
    queryFn: () => {
      if (categoryId) {
        return adminApi.getProducts(page, 20, debouncedKeyword || undefined, Number(categoryId))
      }
      return adminApi.getProducts(page, 20, debouncedKeyword || undefined)
    },
  })

  // Gruplu görünüm — tüm ürünleri tek seferde çek (arama yoksa, admin için makul)
  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['admin', 'products', 'all', categoryId],
    queryFn: () => {
      if (categoryId) return adminApi.getProducts(0, 1000, undefined, Number(categoryId))
      return adminApi.getProducts(0, 1000)
    },
    enabled: viewMode === 'grouped' && !debouncedKeyword,
    staleTime: 30_000,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast.success('Ürün silindi')
    },
    onError: () => toast.error('Ürün silinemedi'),
  })

  const deleteAllMutation = useMutation({
    mutationFn: () => adminApi.deleteAllProducts(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      setDeleteAllConfirm(false)
      toast.success('Tüm ürünler silindi')
    },
    onError: () => toast.error('Silme işlemi başarısız'),
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

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleDelete = (id: number, name: string) => {
    if (confirm(`"${name}" silinsin mi?`)) deleteMutation.mutate(id)
  }

  const handleToggle = (id: number, patch: Record<string, boolean>) => {
    toggleMutation.mutate({ id, patch })
  }

  /* Group by category — allData kullan (tüm ürünler), arama varsa products kullan */
  const groupSource = (viewMode === 'grouped' && !debouncedKeyword)
    ? (allData?.content ?? [])
    : products

  const grouped = (viewMode === 'grouped' && !debouncedKeyword)
    ? groupSource.reduce<Record<string, ProductDto[]>>((acc, p) => {
        const cat = p.categoryName || 'Kategori Yok'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(p)
        return acc
      }, {})
    : null

  const isGroupedLoading = viewMode === 'grouped' && !debouncedKeyword
    ? allLoading
    : isLoading

  const tableHeader = (
    <thead className="border-b border-gray-100 bg-gray-50">
      <tr>
        <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Ürün</th>
        <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Model Kodu</th>
        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Fiyat</th>
        <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Stok</th>
        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aktif</th>
        <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Öne Çıkan</th>
        <th className="px-4 py-3" />
      </tr>
    </thead>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-y-3">
        <h1 className="text-2xl font-extrabold text-navy-dark">Ürünler</h1>
        <div className="flex flex-wrap items-center gap-2">

          {/* Delete all */}
          {deleteAllConfirm ? (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-red-600">Emin misiniz? Bu geri alınamaz!</span>
              <button
                onClick={() => deleteAllMutation.mutate()}
                disabled={deleteAllMutation.isPending}
                className="text-xs font-bold text-white bg-red-500 hover:bg-red-600
                           px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {deleteAllMutation.isPending
                  ? <><Loader2 size={12} className="animate-spin" /> Siliniyor…</>
                  : 'Evet, Sil'}
              </button>
              <button
                onClick={() => setDeleteAllConfirm(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-2 py-1.5"
              >
                İptal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteAllConfirm(true)}
              className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50
                         font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
            >
              <AlertTriangle size={15} /> Tümünü Sil
            </button>
          )}

          <Link
            href="/admin/urunler/import"
            className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:border-orange
                       hover:text-orange font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <FileSpreadsheet size={16} /> Excel İçe Aktar
          </Link>
          <Link
            href="/admin/urunler/yeni"
            className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
          >
            <Plus size={16} /> Yeni Ürün
          </Link>
        </div>
      </div>

      {/* Filters + View toggle */}
      <div className="flex gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(0) }}
            placeholder="Ürün ara…"
            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm
                       focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setPage(0) }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20
                     min-w-[160px]"
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* View mode toggle */}
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
          <button
            onClick={() => setViewMode('grouped')}
            title="Kategoriye göre grupla"
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors
              ${viewMode === 'grouped' ? 'bg-orange text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Layers size={15} />
          </button>
          <button
            onClick={() => setViewMode('flat')}
            title="Düz liste"
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors
              ${viewMode === 'flat' ? 'bg-orange text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Package size={15} />
          </button>
        </div>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 -mt-3">
        💡 Bir ürün satırına tıklayarak renk ve beden varyantlarını görebilirsiniz.
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        {isGroupedLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-orange animate-spin" />
          </div>
        ) : groupSource.length === 0 && products.length === 0 ? (
          <div className="py-16 text-center">
            <Package size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Ürün bulunamadı</p>
          </div>
        ) : grouped ? (
          /* ── Grouped view ── */
          <table className="w-full text-sm">
            {tableHeader}
            <tbody className="divide-y divide-gray-50">
              {Object.entries(grouped)
                .sort(([a], [b]) => a.localeCompare(b, 'tr'))
                .map(([catName, catProducts]) => (
                  <CategoryGroup
                    key={catName}
                    categoryName={catName}
                    products={catProducts}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onDelete={handleDelete}
                    onToggle={handleToggle}
                    deleteIsPending={deleteMutation.isPending}
                    toggleIsPending={toggleMutation.isPending}
                  />
                ))}
            </tbody>
          </table>
        ) : (
          /* ── Flat view (or search results) ── */
          <table className="w-full text-sm">
            {tableHeader}
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <ProductRow
                  key={p.id}
                  p={p}
                  expanded={expandedIds.has(p.id)}
                  onToggleExpand={() => toggleExpand(p.id)}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  deleteIsPending={deleteMutation.isPending}
                  toggleIsPending={toggleMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-sm font-semibold border border-gray-200 rounded-xl
                       disabled:opacity-40 hover:border-orange hover:text-orange transition-colors"
          >
            Önceki
          </button>
          <span className="text-sm text-gray-500">{page + 1} / {totalPages}</span>
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
