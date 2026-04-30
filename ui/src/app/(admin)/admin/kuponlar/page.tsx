'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, X, Loader2, Ticket, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '@/domains/admin/admin.api'
import { formatPrice } from '@/utils/format'
import type { CouponDto } from '@/domains/coupons/coupons.types'

const schema = z.object({
  code:                  z.string().min(3, 'En az 3 karakter'),
  description:           z.string().optional(),
  discountType:          z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'FREE_SHIPPING']),
  discountValue:         z.string().min(1, 'Değer girin'),  // submit'te Number() ile çevir
  minimumOrderAmount:    z.string().optional(),
  maximumDiscountAmount: z.string().optional(),
  usageLimit:            z.string().optional(),
  startsAt:              z.string().optional(),
  expiresAt:             z.string().optional(),
  firstOrderOnly:        z.boolean().optional(),
  isActive:              z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const inputCls = () =>
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:border-orange focus:ring-orange/20'

interface ModalProps {
  onClose: () => void
  onSave: (values: FormValues) => void
  isLoading: boolean
}

function CouponModal({ onClose, onSave, isLoading }: ModalProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { discountType: 'PERCENTAGE', isActive: true, firstOrderOnly: false },
  })
  const discountType = useWatch({ control, name: 'discountType' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={18} />
        </button>
        <h3 className="font-extrabold text-navy-dark text-lg mb-5">Yeni Kupon</h3>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Kupon Kodu *</label>
              <input {...register('code')} placeholder="YENI10"
                className={`${inputCls()} uppercase`} />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">İndirim Türü *</label>
              <select {...register('discountType')} className={inputCls()}>
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
              <input {...register('discountValue')} type="number" step="0.01" min="0"
                className={inputCls()} />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Açıklama</label>
            <input {...register('description')} placeholder="Opsiyonel" className={inputCls()} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Min. Sipariş (₺)</label>
              <input {...register('minimumOrderAmount')} type="number" min="0"
                placeholder="Opsiyonel" className={inputCls()} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Max. İndirim (₺)</label>
              <input {...register('maximumDiscountAmount')} type="number" min="0"
                placeholder="Opsiyonel" className={inputCls()} />
            </div>
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
              Oluştur
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

export default function AdminKuponlarPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: () => adminApi.getCoupons(page, 20),
  })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      adminApi.createCoupon({
        code: values.code.toUpperCase(),
        description: values.description,
        discountType: values.discountType,
        discountValue: Number(values.discountValue),
        minimumOrderAmount: values.minimumOrderAmount ? Number(values.minimumOrderAmount) : undefined,
        maximumDiscountAmount: values.maximumDiscountAmount ? Number(values.maximumDiscountAmount) : undefined,
        usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
        startsAt: values.startsAt || undefined,
        expiresAt: values.expiresAt || undefined,
        firstOrderOnly: values.firstOrderOnly,
        isActive: values.isActive,
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

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminApi.updateCoupon(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] }),
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
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                     font-bold px-4 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} /> Yeni Kupon
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
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
                    {c.description && (
                      <p className="text-xs text-gray-400">{c.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold text-orange">{discountLabel(c)}</td>
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

      {showModal && (
        <CouponModal
          onClose={() => setShowModal(false)}
          onSave={(v) => createMutation.mutate(v)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  )
}
