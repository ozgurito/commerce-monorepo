'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  MapPin, Plus, Trash2, Edit2, Star, Loader2, X, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { addressesApi } from '@/domains/addresses/addresses.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import type { UserAddressDto } from '@/domains/addresses/addresses.types'

const schema = z.object({
  title:       z.string().min(2, 'Başlık en az 2 karakter'),
  fullName:    z.string().min(3, 'Ad Soyad en az 3 karakter'),
  phone:       z.string().regex(/^[0-9]{10,11}$/, 'Geçerli telefon girin'),
  city:        z.string().min(2, 'Şehir zorunlu'),
  district:    z.string().min(2, 'İlçe zorunlu'),
  addressLine: z.string().min(10, 'Adres en az 10 karakter'),
  postalCode:  z.string().optional(),
  isDefault:   z.boolean().optional(),
})
type FormValues = z.infer<typeof schema>

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
     : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

interface AddressFormProps {
  defaultValues?: Partial<FormValues>
  onSubmit: (values: FormValues) => void
  onCancel: () => void
  isLoading: boolean
  submitLabel: string
}

function AddressFormModal({ defaultValues, onSubmit, onCancel, isLoading, submitLabel }: AddressFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isDefault: false, ...defaultValues },
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
        >
          <X size={18} />
        </button>
        <h3 className="font-extrabold text-navy-dark text-lg mb-5">{submitLabel}</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Adres Başlığı *</label>
            <input {...register('title')} placeholder="Ev, İş, vb." className={inputCls(!!errors.title)} />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Ad Soyad *</label>
              <input {...register('fullName')} className={inputCls(!!errors.fullName)} />
              {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Telefon *</label>
              <input {...register('phone')} type="tel" placeholder="05XX…" className={inputCls(!!errors.phone)} />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Şehir *</label>
              <input {...register('city')} placeholder="İstanbul" className={inputCls(!!errors.city)} />
              {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">İlçe *</label>
              <input {...register('district')} placeholder="Kadıköy" className={inputCls(!!errors.district)} />
              {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Adres *</label>
            <textarea
              {...register('addressLine')}
              rows={3}
              placeholder="Mahalle, sokak, bina ve daire no"
              className={inputCls(!!errors.addressLine)}
            />
            {errors.addressLine && <p className="text-xs text-red-500 mt-1">{errors.addressLine.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Posta Kodu</label>
            <input {...register('postalCode')} placeholder="34000" className={inputCls()} />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input {...register('isDefault')} type="checkbox" className="w-4 h-4 accent-orange" />
            <span className="text-sm text-gray-600">Varsayılan adres olarak kaydet</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-orange hover:bg-orange-dark text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdreslerimPage() {
  const queryClient = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<UserAddressDto | null>(null)

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.addresses.all,
    queryFn: addressesApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: (v: FormValues) =>
      addressesApi.create({
        title: v.title, fullName: v.fullName, phone: v.phone,
        city: v.city, district: v.district, addressLine: v.addressLine,
        postalCode: v.postalCode, isDefault: v.isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses.all })
      setShowAdd(false)
      toast.success('Adres eklendi')
    },
    onError: () => toast.error('Adres eklenemedi'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: FormValues }) =>
      addressesApi.update(id, {
        title: values.title, fullName: values.fullName, phone: values.phone,
        city: values.city, district: values.district, addressLine: values.addressLine,
        postalCode: values.postalCode, isDefault: values.isDefault,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses.all })
      setEditTarget(null)
      toast.success('Adres güncellendi')
    },
    onError: () => toast.error('Güncelleme başarısız'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses.all })
      toast.success('Adres silindi')
    },
  })

  const defaultMutation = useMutation({
    mutationFn: (id: number) => addressesApi.setDefault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses.all })
      toast.success('Varsayılan adres güncellendi')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-[680px]">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-orange/10 rounded-2xl flex items-center justify-center flex-shrink-0">
          <MapPin size={22} className="text-orange" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-navy-dark">Adreslerim</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {addresses.length > 0
              ? `${addresses.length} kayıtlı adres`
              : 'Teslimat adreslerinizi yönetin'}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 bg-orange hover:bg-orange-dark text-white
                     font-bold px-4 py-2.5 rounded-xl transition-colors text-sm
                     shadow-md shadow-orange/20 flex-shrink-0"
        >
          <Plus size={15} /> Yeni Adres
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <div className="w-20 h-20 bg-orange/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin size={32} className="text-orange/30" />
          </div>
          <p className="font-bold text-gray-600 mb-1">Kayıtlı adresiniz yok</p>
          <p className="text-sm text-gray-400 mb-6">Teslimat adresinizi ekleyerek hızlı alışveriş yapın</p>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-6 py-3 rounded-xl transition-colors text-sm
                       shadow-md shadow-orange/20"
          >
            <Plus size={16} /> Adres Ekle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-2xl border p-5 relative
                          ${addr.isDefault ? 'border-orange/40 bg-orange/5' : 'border-gray-100'}`}
            >
              {addr.isDefault && (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px]
                                 font-bold text-orange bg-orange/10 px-2 py-0.5 rounded-full">
                  <Star size={9} fill="currentColor" /> Varsayılan
                </span>
              )}
              <p className="font-bold text-navy-dark mb-1">{addr.title}</p>
              <p className="text-sm text-gray-600">{addr.fullName}</p>
              <p className="text-xs text-gray-400">{addr.phone}</p>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{addr.addressLine}</p>
              <p className="text-xs text-gray-400">{addr.district} / {addr.city}</p>

              <div className="flex items-center gap-2 mt-4">
                {!addr.isDefault && (
                  <button
                    onClick={() => defaultMutation.mutate(addr.id)}
                    disabled={defaultMutation.isPending}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange
                               border border-gray-200 hover:border-orange px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <Check size={11} /> Varsayılan Yap
                  </button>
                )}
                <button
                  onClick={() => setEditTarget(addr)}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-navy-dark
                             border border-gray-200 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Edit2 size={11} /> Düzenle
                </button>
                <button
                  onClick={() => {
                    if (confirm('Adresi silmek istediğinizden emin misiniz?')) {
                      deleteMutation.mutate(addr.id)
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600
                             border border-gray-200 hover:border-red-200 px-2.5 py-1.5 rounded-lg transition-colors ml-auto"
                >
                  <Trash2 size={11} /> Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Yeni adres modalı */}
      {showAdd && (
        <AddressFormModal
          submitLabel="Yeni Adres Ekle"
          isLoading={createMutation.isPending}
          onCancel={() => setShowAdd(false)}
          onSubmit={(values) => createMutation.mutate(values)}
        />
      )}

      {/* Düzenleme modalı */}
      {editTarget && (
        <AddressFormModal
          submitLabel="Adresi Güncelle"
          isLoading={updateMutation.isPending}
          defaultValues={{
            title: editTarget.title,
            fullName: editTarget.fullName,
            phone: editTarget.phone,
            city: editTarget.city,
            district: editTarget.district,
            addressLine: editTarget.addressLine,
            postalCode: editTarget.postalCode ?? '',
            isDefault: editTarget.isDefault,
          }}
          onCancel={() => setEditTarget(null)}
          onSubmit={(values) => updateMutation.mutate({ id: editTarget.id, values })}
        />
      )}
    </div>
  )
}
