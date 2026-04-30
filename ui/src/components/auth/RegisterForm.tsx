'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/domains/auth/auth.api'
import { useAuthStore } from '@/store/auth.store'

const schema = z.object({
  fullName:        z.string().min(3, 'Ad Soyad en az 3 karakter'),
  email:           z.string().email('Geçerli bir e-posta girin'),
  password:        z.string().min(6, 'Şifre en az 6 karakter'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı zorunlu'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})

type FormValues = z.infer<typeof schema>

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
     : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

interface Props {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: Props) {
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const res = await authApi.register({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      })
      login(res)
      toast.success('Hoş geldiniz!')
      onSuccess?.()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Kayıt oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Ad Soyad */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Ad Soyad *</label>
        <input
          {...register('fullName')}
          placeholder="Ad Soyad"
          autoComplete="name"
          className={inputCls(!!errors.fullName)}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
        )}
      </div>

      {/* E-posta */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">E-posta *</label>
        <input
          {...register('email')}
          type="email"
          placeholder="ornek@email.com"
          autoComplete="email"
          className={inputCls(!!errors.email)}
        />
        {errors.email && (
          <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Şifre */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Şifre *</label>
        <div className="relative">
          <input
            {...register('password')}
            type={showPass ? 'text' : 'password'}
            placeholder="En az 6 karakter"
            autoComplete="new-password"
            className={inputCls(!!errors.password)}
          />
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Şifre Tekrar */}
      <div>
        <label className="block text-xs font-bold text-gray-600 mb-1">Şifre Tekrar *</label>
        <input
          {...register('confirmPassword')}
          type={showPass ? 'text' : 'password'}
          placeholder="Şifrenizi tekrar girin"
          autoComplete="new-password"
          className={inputCls(!!errors.confirmPassword)}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-500 mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange hover:bg-orange-dark text-white font-bold py-3
                   rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Kaydediliyor…' : 'Üye Ol'}
      </button>

      {onSwitchToLogin && (
        <p className="text-center text-sm text-gray-500">
          Zaten hesabınız var mı?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-orange font-bold hover:underline"
          >
            Giriş Yap
          </button>
        </p>
      )}
    </form>
  )
}
