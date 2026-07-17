'use client'
import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit2, Trash2, X, Loader2, Ticket, ToggleLeft, ToggleRight, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { categoriesApi } from '@/domains/categories/categories.api'
import { buildTreeOptions } from '@/components/admin/CategorySelect'
import { formatPrice } from '@/utils/format'
import type { CouponDto } from '@/domains/coupons/coupons.types'
import type { ProductDto } from '@/domains/products/products.types'

const PERCENTAGE_PRESETS = [5, 10, 15, 20, 25, 30, 40, 50]
const FIXED_AMOUNT_PRESETS = [15, 20, 25, 50, 75, 100, 150, 200]
const MIN_ORDER_PRESETS = [0, 100, 150, 200, 250, 300, 500, 750, 1000]

const schema = z.object({
  code:                  z.string().min(3, 'En az 3 karakter'),
  description:           z.string().optional(),
  discountType:          z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue:         z.string().min(1, 'Değer girin'),
  minimumOrderAmount:    z.string().optional(),
  maximumDiscountAmount: z.string().optional(),
  usageLimit:            z.string().optional(),
  startsAt:              z.string().optional(),
  expiresAt:             z.string().optional(),
  firstOrderOnly:        z.boolean().optional(),
  isActive:              z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

type ScopeType = 'ALL' | 'CATEGORY' | 'PRODUCT'
interface ScopeValues {
  scopeType: ScopeType
  categoryIds: number[]
  productIds: number[]
}

const inputCls = () =>
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20'

const SCOPE_OPTIONS: { value: ScopeType; label: string }[] = [
  { value: 'ALL', label: 'Tüm Ürünler' },
  { value: 'CATEGORY', label: 'Kategori Seç' },
  { value: 'PRODUCT', label: 'Belirli Ürün' },
]

interface ModalProps {
  editTarget: CouponDto | null
  onClose: () => void
  onSave: (values: FormValues, scope: ScopeValues) => void
  isLoading: boolean
}

function CouponModal({ editTarget, onClose, onSave, isLoading }: ModalProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: editTarget
      ? {
          code:                  editTarget.code,
          description:           editTarget.description ?? '',
          discountType:          editTarget.discountType,
          discountValue:         String(editTarget.discountValue),
          minimumOrderAmount:    editTarget.minimumOrderAmount ? String(editTarget.minimumOrderAmount) : '',
          maximumDiscountAmount: editTarget.maximumDiscountAmount ? String(editTarget.maximumDiscountAmount) : '',
          usageLimit:            editTarget.usageLimit ? String(editTarget.usageLimit) : '',
          startsAt:              editTarget.startsAt ? editTarget.startsAt.slice(0, 10) : '',
          expiresAt:             editTarget.expiresAt ? editTarget.expiresAt.slice(0, 10) : '',
          firstOrderOnly:        editTarget.firstOrderOnly,
          isActive:              editTarget.isActive,
        }
      : { discountType: 'PERCENTAGE', isActive: true, firstOrderOnly: false },
  })
  const discountType = useWatch({ control, name: 'discountType' })
  const discountValueRaw = watch('discountValue')
  const minOrderRaw = watch('minimumOrderAmount')

  // ── Kapsam (Kupon Kapsamı) ──────────────────────────────────────
  const [scopeType, setScopeType] = useState<ScopeType>(() => {
    if (editTarget?.applicableProductIds?.length) return 'PRODUCT'
    if (editTarget?.applicableCategoryIds?.length) return 'CATEGORY'
    return 'ALL'
  })
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(editTarget?.applicableCategoryIds ?? [])
  const [selectedProducts, setSelectedProducts] = useState<{ id: number; name: string }[]>([])
  const [productQuery, setProductQuery] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  })
  const categoryOptions = buildTreeOptions(categories)

  const editProductIds = editTarget?.applicableProductIds ?? []
  const { data: resolvedEditProducts } = useQuery({
    queryKey: ['admin', 'coupon-scope-products', editTarget?.id],
    queryFn: () => Promise.all(editProductIds.map((id) => adminApi.getProduct(id))),
    enabled: editProductIds.length > 0,
  })
  useEffect(() => {
    if (resolvedEditProducts) {
      setSelectedProducts(resolvedEditProducts.map((p) => ({ id: p.id, name: p.name })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedEditProducts])

  const { data: searchResults = [], isFetching: searchLoading } = useQuery({
    queryKey: ['admin', 'coupon-product-search', productQuery],
    queryFn: () => adminApi.getProducts(0, 8, productQuery),
    enabled: productQuery.trim().length >= 2,
    select: (res) => res.content,
  })

  function toggleCategory(id: number) {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  function addProduct(p: ProductDto) {
    setSelectedProducts((prev) => (prev.some((sp) => sp.id === p.id) ? prev : [...prev, { id: p.id, name: p.name }]))
    setProductQuery('')
  }
  function removeProduct(id: number) {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const discountPresets = discountType === 'PERCENTAGE' ? PERCENTAGE_PRESETS : FIXED_AMOUNT_PRESETS

  function submit(values: FormValues) {
    onSave(values, {
      scopeType,
      categoryIds: selectedCategoryIds,
      productIds: selectedProducts.map((p) => p.id),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <h3 className="font-extrabold text-navy-dark text-lg mb-5">
          {editTarget ? 'Kuponu Düzenle' : 'Yeni Kupon'}
        </h3>

        <form onSubmit={handleSubmit(submit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Kupon Kodu *</label>
              <input {...register('code')} placeholder="YENI10"
                readOnly={!!editTarget}
                className={`${inputCls()} uppercase ${editTarget ? 'bg-gray-50 cursor-default' : ''}`} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">İndirim Türü *</label>
              <select {...register('discountType')} disabled={!!editTarget} className={inputCls()}>
                <option value="PERCENTAGE">Yüzde (%)</option>
                <option value="FIXED_AMOUNT">Sabit Tutar (₺)</option>
                <option value="FREE_SHIPPING">Ücretsiz Kargo</option>
              </select>
            </div>
          </div>

          {discountType !== 'FREE_SHIPPING' && (
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                İndirim Değeri {discountType === 'PERCENTAGE' ? '(%)' : '(₺)'} *
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {discountPresets.map((v) => (
                  <button type="button" key={v}
                    onClick={() => setValue('discountValue', String(v), { shouldValidate: true })}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      Number(discountValueRaw) === v
                        ? 'bg-orange text-white border-orange'
                        : 'border-gray-200 text-gray-600 hover:border-orange hover:text-orange'
                    }`}>
                    {discountType === 'PERCENTAGE' ? `%${v}` : `${v}₺`}
                  </button>
                ))}
              </div>
              <input {...register('discountValue')} type="number" step="0.01" min="0" className={inputCls()} />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Açıklama</label>
            <input {...register('description')} placeholder="Opsiyonel" className={inputCls()} />
          </div>

          {/* ── Kupon Kapsamı ─────────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Kupon Kapsamı</label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {SCOPE_OPTIONS.map((opt) => (
                <button type="button" key={opt.value} onClick={() => setScopeType(opt.value)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                    scopeType === opt.value
                      ? 'bg-orange text-white border-orange'
                      : 'border-gray-200 text-gray-600 hover:border-orange hover:text-orange'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {scopeType === 'CATEGORY' && (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-0.5">
                {categoryOptions.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-3">Kategori bulunamadı</p>
                ) : (
                  categoryOptions.map((o) => (
                    <label key={o.id}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer text-sm">
                      <input type="checkbox" className="w-4 h-4 accent-orange shrink-0"
                        checked={selectedCategoryIds.includes(o.id)}
                        onChange={() => toggleCategory(o.id)} />
                      <span className="whitespace-pre text-gray-700">{o.label}</span>
                    </label>
                  ))
                )}
              </div>
            )}

            {scopeType === 'PRODUCT' && (
              <div>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={productQuery} onChange={(e) => setProductQuery(e.target.value)}
                    placeholder="Ürün ara (isim veya model kodu)..." className={`${inputCls()} pl-9`} />
                </div>
                {productQuery.trim().length >= 2 && (
                  <div className="mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-50">
                    {searchLoading ? (
                      <div className="p-3 text-center"><Loader2 className="animate-spin mx-auto text-orange" size={16} /></div>
                    ) : searchResults.length === 0 ? (
                      <p className="p-3 text-xs text-gray-400 text-center">Sonuç yok</p>
                    ) : (
                      searchResults.map((p) => (
                        <button type="button" key={p.id} onClick={() => addProduct(p)}
                          disabled={selectedProducts.some((sp) => sp.id === p.id)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40
                                     disabled:cursor-not-allowed flex justify-between items-center gap-2">
                          <span className="truncate">{p.name}</span>
                          <span className="text-xs text-gray-400 shrink-0">{formatPrice(p.price)}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedProducts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedProducts.map((p) => (
                      <span key={p.id}
                        className="inline-flex items-center gap-1 bg-orange/10 text-orange text-xs font-semibold px-2.5 py-1 rounded-full">
                        {p.name}
                        <button type="button" onClick={() => removeProduct(p.id)} className="hover:text-orange-dark">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Min. Sipariş Tutarı (₺)</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {MIN_ORDER_PRESETS.map((v) => (
                <button type="button" key={v}
                  onClick={() => setValue('minimumOrderAmount', String(v), { shouldValidate: true })}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    Number(minOrderRaw || 0) === v
                      ? 'bg-orange text-white border-orange'
                      : 'border-gray-200 text-gray-600 hover:border-orange hover:text-orange'
                  }`}>
                  {v === 0 ? 'Yok' : `${v}₺`}
                </button>
              ))}
            </div>
            <input {...register('minimumOrderAmount')} type="number" min="0"
              placeholder="Opsiyonel" className={inputCls()} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Max. İndirim (₺)</label>
            <input {...register('maximumDiscountAmount')} type="number" min="0"
              placeholder="Opsiyonel — sadece yüzde indirimde geçerli üst limit" className={inputCls()} />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Kullanım Limiti</label>
            <input {...register('usageLimit')} type="number" min="0"
              placeholder="Sınırsız için boş bırakın" className={inputCls()} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Başlangıç Tarihi</label>
              <input {...register('startsAt')} type="date" className={inputCls()} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Bitiş Tarihi</label>
              <input {...register('expiresAt')} type="date" className={inputCls()} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('isActive')} type="checkbox" className="w-4 h-4 accent-orange" />
              <span className="text-sm text-gray-600">Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('firstOrderOnly')} type="checkbox" className="w-4 h-4 accent-orange" />
              <span className="text-sm text-gray-600">Sadece ilk sipariş</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm">
              İptal
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 bg-orange hover:bg-orange-dark text-white font-bold py-2.5
                         rounded-xl transition-colors disabled:opacity-60 text-sm
                         flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {editTarget ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function discountLabel(c: CouponDto) {
  if (c.discountType === 'PERCENTAGE') return `%${c.discountValue}`
  if (c.discountType === 'FIXED_AMOUNT') return formatPrice(c.discountValue)
  return 'Ücretsiz Kargo'
}

function scopeLabel(c: CouponDto) {
  if (c.applicableProductIds?.length) return `${c.applicableProductIds.length} Ürün`
  if (c.applicableCategoryIds?.length) return `${c.applicableCategoryIds.length} Kategori`
  return 'Tüm Ürünler'
}

// Backend LocalDateTime bekliyor — <input type="date"> düz "YYYY-MM-DD" gönderir, saat eklenmeli
function toStartOfDayIso(dateStr?: string): string | undefined {
  return dateStr ? `${dateStr}T00:00:00` : undefined
}
function toEndOfDayIso(dateStr?: string): string | undefined {
  return dateStr ? `${dateStr}T23:59:59` : undefined
}

export default function AdminKuponlarPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState<CouponDto | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: () => adminApi.getCoupons(page, 20),
  })

  const createMutation = useMutation({
    mutationFn: ({ values, scope }: { values: FormValues; scope: ScopeValues }) =>
      adminApi.createCoupon({
        code:                  values.code.toUpperCase(),
        description:           values.description,
        discountType:          values.discountType,
        discountValue:         Number(values.discountValue),
        minimumOrderAmount:    values.minimumOrderAmount ? Number(values.minimumOrderAmount) : undefined,
        maximumDiscountAmount: values.maximumDiscountAmount ? Number(values.maximumDiscountAmount) : undefined,
        usageLimit:            values.usageLimit ? Number(values.usageLimit) : undefined,
        startsAt:              toStartOfDayIso(values.startsAt),
        expiresAt:             toEndOfDayIso(values.expiresAt),
        applicableCategoryIds: scope.scopeType === 'CATEGORY' ? scope.categoryIds : [],
        applicableProductIds:  scope.scopeType === 'PRODUCT' ? scope.productIds : [],
        firstOrderOnly:        values.firstOrderOnly,
        isActive:              values.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setShowModal(false)
      toast.success('Kupon oluşturuldu')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Oluşturma başarısız')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values, scope }: { id: number; values: FormValues; scope: ScopeValues }) =>
      adminApi.updateCoupon(id, {
        description:           values.description,
        discountValue:         Number(values.discountValue),
        minimumOrderAmount:    values.minimumOrderAmount ? Number(values.minimumOrderAmount) : undefined,
        maximumDiscountAmount: values.maximumDiscountAmount ? Number(values.maximumDiscountAmount) : undefined,
        usageLimit:            values.usageLimit ? Number(values.usageLimit) : undefined,
        startsAt:              toStartOfDayIso(values.startsAt),
        expiresAt:             toEndOfDayIso(values.expiresAt),
        applicableCategoryIds: scope.scopeType === 'CATEGORY' ? scope.categoryIds : [],
        applicableProductIds:  scope.scopeType === 'PRODUCT' ? scope.productIds : [],
        firstOrderOnly:        values.firstOrderOnly,
        isActive:              values.isActive,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      setEditTarget(null)
      toast.success('Kupon güncellendi')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Güncelleme başarısız')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminApi.updateCoupon(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
    onError: () => toast.error('Güncelleme başarısız'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      toast.success('Kupon silindi')
    },
  })

  const coupons = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Kuponlar</h1>
        <button
          onClick={() => { setEditTarget(null); setShowModal(true) }}
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                     font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Yeni Kupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={24} className="text-orange animate-spin" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Kupon bulunamadı</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase">Kod</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">İndirim</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Kapsam</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Min. Sipariş</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-gray-500 uppercase">Kullanım</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">Bitiş</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-gray-500 uppercase">Aktif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="font-mono font-bold text-navy-dark">{c.code}</span>
                    {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange">{discountLabel(c)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{scopeLabel(c)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.minimumOrderAmount ? formatPrice(c.minimumOrderAmount) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleMutation.mutate({ id: c.id, isActive: !c.isActive })}
                      disabled={toggleMutation.isPending}
                      className="text-gray-400 hover:text-orange transition-colors disabled:opacity-50"
                    >
                      {c.isActive
                        ? <ToggleRight size={22} className="text-green-500" />
                        : <ToggleLeft size={22} />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={() => setEditTarget(c)}
                        className="p-1.5 text-gray-400 hover:text-navy-dark hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`"${c.code}" silinsin mi?`)) deleteMutation.mutate(c.id)
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

      {(showModal || editTarget) && (
        <CouponModal
          editTarget={editTarget}
          onClose={() => { setShowModal(false); setEditTarget(null) }}
          isLoading={createMutation.isPending || updateMutation.isPending}
          onSave={(values, scope) =>
            editTarget
              ? updateMutation.mutate({ id: editTarget.id, values, scope })
              : createMutation.mutate({ values, scope })
          }
        />
      )}
    </div>
  )
}
