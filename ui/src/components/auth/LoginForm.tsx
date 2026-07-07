'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/domains/auth/auth.api'
import { useAuthStore } from '@/store/auth.store'
import { mergeGuestCartIntoServerCart } from '@/store/guest-cart.store'

const schema = z.object({
  email:    z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
})
type FormValues = z.infer<typeof schema>

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
     : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

interface Props {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: Props) {
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
      const res = await authApi.login(values)
      login(res)
      await mergeGuestCartIntoServerCart()
      toast.success('Giriş yapıldı!')
      onSuccess?.()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'E-posta veya şifre hatalı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="••••••••"
            autoComplete="current-password"
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

      {/* Şifremi unuttum */}
      <div className="text-right">
        <a
          href="/sifremi-unuttum"
          className="text-xs text-orange hover:underline font-semibold"
        >
          Şifremi unuttum
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange hover:bg-orange-dark text-white font-bold py-3
                   rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
      </button>

      {onSwitchToRegister && (
        <p className="text-center text-sm text-gray-500">
          Hesabınız yok mu?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-orange font-bold hover:underline"
          >
            Üye Ol
          </button>
        </p>
      )}
    </form>
  )
}
