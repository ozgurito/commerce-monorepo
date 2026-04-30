'use client'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '@/domains/user/user.api'
import { QUERY_KEYS } from '@/lib/query-keys'

const schema = z.object({
  fullName:       z.string().min(3, 'Ad Soyad en az 3 karakter'),
  phone:          z.string().regex(/^[0-9]{10,11}$/, 'Geçerli telefon numarası girin').optional().or(z.literal('')),
  identityNumber: z.string().regex(/^[0-9]{11}$/, 'TCKN 11 haneli olmalı').optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
     : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

export default function HesabimPage() {
  const queryClient = useQueryClient()

  const { data: user, isLoading } = useQuery({
    queryKey: QUERY_KEYS.user.me,
    queryFn: userApi.getMe,
  })

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Kullanıcı verisi yüklenince formu doldur
  useEffect(() => {
    if (user) {
      reset({
        fullName:       user.fullName ?? '',
        phone:          user.phone ?? '',
        identityNumber: user.identityNumber ?? '',
      })
    }
  }, [user, reset])

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      userApi.updateProfile({
        fullName:       values.fullName,
        phone:          values.phone || undefined,
        identityNumber: values.identityNumber || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.me })
      toast.success('Profil güncellendi')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Güncelleme başarısız')
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
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-navy-dark">Profilim</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-navy-dark mb-6">Kişisel Bilgiler</h2>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
          {/* Ad Soyad */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Ad Soyad *</label>
            <input {...register('fullName')} className={inputCls(!!errors.fullName)} />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>}
          </div>

          {/* E-posta (readonly) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">E-posta</label>
            <input
              value={user?.email ?? ''}
              readOnly
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez</p>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Telefon</label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="05XX XXX XX XX"
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          {/* TCKN */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">
              TC Kimlik Numarası (TCKN)
            </label>
            <input
              {...register('identityNumber')}
              placeholder="11 haneli TCKN"
              maxLength={11}
              className={inputCls(!!errors.identityNumber)}
            />
            {errors.identityNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.identityNumber.message}</p>
            )}
            <div className="flex items-start gap-1.5 mt-1.5">
              <Info size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400">
                iyzico kredi kartı ödemeleri için gereklidir. Girilmezse backend otomatik değer kullanır.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60 text-sm"
          >
            {mutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
              : <><Save size={14} /> Değişiklikleri Kaydet</>}
          </button>
        </form>
      </div>

      {/* Hesap bilgisi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-navy-dark mb-4">Hesap Bilgisi</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Üyelik tarihi</span>
          <span className="font-semibold text-navy-dark">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })
              : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}
