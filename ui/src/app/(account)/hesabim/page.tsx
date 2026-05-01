'use client'
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, Info, Mail, Phone, CreditCard, Shield, Star, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import { userApi } from '@/domains/user/user.api'
import { useAuthStore } from '@/store/auth.store'
import { QUERY_KEYS } from '@/lib/query-keys'

const schema = z.object({
  fullName:       z.string().min(3, 'Ad Soyad en az 3 karakter'),
  phone:          z.string().regex(/^[0-9]{10,11}$/, 'Geçerli telefon numarası girin').optional().or(z.literal('')),
  identityNumber: z.string().regex(/^[0-9]{11}$/, 'TCKN 11 haneli olmalı').optional().or(z.literal('')),
})
type FormValues = z.infer<typeof schema>

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
     : 'border-gray-200 focus:border-orange focus:ring-orange/10'}`

export default function HesabimPage() {
  const queryClient = useQueryClient()
  const { user: authUser } = useAuthStore()

  const { data: user, isLoading } = useQuery({
    queryKey: QUERY_KEYS.user.me,
    queryFn: userApi.getMe,
  })

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

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
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
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

  const initials = (user?.fullName ?? authUser?.fullName ?? '')
    .split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'

  const memberDays = user?.createdAt
    ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86_400_000)
    : 0

  return (
    <div className="space-y-5">

      {/* ── Profile hero card ── */}
      <div className="bg-gradient-to-r from-navy-dark to-navy rounded-2xl p-6 text-white
                      relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
        <div className="absolute top-8 -right-2 w-16 h-16 bg-white/5 rounded-full" />

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange to-orange-dark
                          flex items-center justify-center shadow-lg shadow-orange/30 flex-shrink-0">
            <span className="text-white font-extrabold text-2xl">{initials}</span>
          </div>
          <div>
            <p className="text-white/70 text-xs mb-0.5">Hoş geldiniz,</p>
            <h1 className="text-xl font-extrabold text-white">{user?.fullName ?? 'Üye'}</h1>
            <p className="text-white/60 text-xs mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-5 border-t border-white/10 pt-4">
          {[
            { icon: Star,    label: 'Üye',        value: 'Premium' },
            { icon: Package, label: 'Gün Üye',    value: memberDays.toString() },
            { icon: Shield,  label: 'Hesap',      value: 'Güvenli' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Icon size={12} className="text-orange" />
                <span className="text-[10px] text-white/50">{label}</span>
              </div>
              <span className="text-sm font-extrabold text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Form card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-extrabold text-navy-dark mb-5 flex items-center gap-2">
          <div className="w-7 h-7 bg-orange/10 rounded-lg flex items-center justify-center">
            <CreditCard size={14} className="text-orange" />
          </div>
          Kişisel Bilgiler
        </h2>

        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
          {/* Ad Soyad */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Ad Soyad *</label>
            <input {...register('fullName')} className={inputCls(!!errors.fullName)} />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* E-posta (readonly) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Mail size={11} className="text-gray-400" /> E-posta
              </span>
            </label>
            <input
              value={user?.email ?? ''}
              readOnly
              className="w-full border border-gray-100 rounded-xl px-4 py-3 text-sm
                         bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-[11px] text-gray-400 mt-1">E-posta adresi değiştirilemez</p>
          </div>

          {/* Telefon */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Phone size={11} className="text-gray-400" /> Telefon
              </span>
            </label>
            <input
              {...register('phone')}
              type="tel"
              placeholder="05XX XXX XX XX"
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* TCKN */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">
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
            <div className="flex items-start gap-1.5 mt-1.5 p-3 bg-blue-50 rounded-xl">
              <Info size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-600">
                Kredi kartı ödemeleri için gereklidir. Girilmezse sistem otomatik değer kullanır.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !isDirty}
            className="flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60
                       disabled:cursor-not-allowed text-sm shadow-md shadow-orange/20
                       active:scale-[0.98]"
          >
            {mutation.isPending
              ? <><Loader2 size={14} className="animate-spin" /> Kaydediliyor…</>
              : <><Save size={14} /> Değişiklikleri Kaydet</>}
          </button>
        </form>
      </div>

      {/* ── Account info card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-navy-dark mb-4 text-sm">Hesap Bilgisi</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
            <span className="text-gray-500">Üyelik tarihi</span>
            <span className="font-semibold text-navy-dark">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('tr-TR', { dateStyle: 'long' })
                : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm py-2 border-b border-gray-50">
            <span className="text-gray-500">Hesap türü</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-orange">
              <Star size={13} className="fill-orange" /> Premium Üye
            </span>
          </div>
          <div className="flex items-center justify-between text-sm py-2">
            <span className="text-gray-500">Güvenlik</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-green-600">
              <Shield size={13} /> SSL Korumalı
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
