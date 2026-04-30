'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { authApi } from '@/domains/auth/auth.api'

const schema = z.object({
  newPassword:     z.string().min(6, 'Şifre en az 6 karakter'),
  confirmPassword: z.string().min(1, 'Şifre tekrarı zorunlu'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

const inputCls = (hasError?: boolean) =>
  `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-1 transition-colors
   ${hasError
     ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
     : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`

function SifreSifirlaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-navy-dark mb-2">Geçersiz Bağlantı</h2>
        <p className="text-sm text-gray-500 mb-6">
          Sıfırlama bağlantısı geçersiz veya süresi dolmuş.
        </p>
        <Link href="/sifremi-unuttum" className="text-orange font-bold hover:underline text-sm">
          Yeni bağlantı talep et
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-navy-dark mb-2">Şifre Güncellendi</h2>
        <p className="text-sm text-gray-500 mb-6">
          Yeni şifrenizle giriş yapabilirsiniz.
        </p>
        <button
          onClick={() => router.push('/giris')}
          className="bg-orange hover:bg-orange-dark text-white font-bold
                     px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Giriş Yap
        </button>
      </div>
    )
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await authApi.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError('newPassword', { message: msg ?? 'Şifre güncellenemedi. Bağlantı süresi dolmuş olabilir.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-extrabold text-orange">
          Alışveriş<span className="text-navy-dark">Noktan</span>
        </Link>
        <h1 className="text-xl font-extrabold text-navy-dark mt-4">Yeni Şifre Belirle</h1>
        <p className="text-sm text-gray-500 mt-1">En az 6 karakter kullanın</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Yeni şifre */}
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Yeni Şifre *</label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPass ? 'text' : 'password'}
              placeholder="En az 6 karakter"
              autoComplete="new-password"
              className={inputCls(!!errors.newPassword)}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Tekrar */}
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
                     rounded-xl transition-colors disabled:opacity-60
                     flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Kaydediliyor…' : 'Şifremi Güncelle'}
        </button>
      </form>
    </>
  )
}

export default function SifreSifirlaPage() {
  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="text-orange animate-spin" />
          </div>
        }>
          <SifreSifirlaContent />
        </Suspense>
      </div>
    </div>
  )
}
