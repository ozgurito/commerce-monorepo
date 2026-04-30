'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { authApi } from '@/domains/auth/auth.api'

const schema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
})
type FormValues = z.infer<typeof schema>

export default function SifremiUnuttumPage() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sentEmail, setSentEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      await authApi.forgotPassword({ email: values.email })
      setSentEmail(values.email)
      setSent(true)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError('email', { message: msg ?? 'Bir hata oluştu. Lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-[420px] px-4">
        <div className="bg-white rounded-2xl shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>
          <h1 className="text-xl font-extrabold text-navy-dark mb-2">E-posta Gönderildi</h1>
          <p className="text-sm text-gray-500 mb-1">
            <span className="font-semibold text-navy-dark">{sentEmail}</span> adresine
            şifre sıfırlama bağlantısı gönderdik.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            E-posta gelmezse spam klasörünüzü kontrol edin.
          </p>
          <Link
            href="/giris"
            className="inline-flex items-center gap-2 text-orange font-bold hover:underline text-sm"
          >
            <ArrowLeft size={14} />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-orange">
            Alışveriş<span className="text-navy-dark">Noktan</span>
          </Link>
          <h1 className="text-xl font-extrabold text-navy-dark mt-4">Şifremi Unuttum</h1>
          <p className="text-sm text-gray-500 mt-1">
            E-posta adresinize sıfırlama bağlantısı gönderelim
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">E-posta *</label>
            <input
              {...register('email')}
              type="email"
              placeholder="ornek@email.com"
              autoComplete="email"
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none
                          focus:ring-1 transition-colors
                          ${errors.email
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                            : 'border-gray-200 focus:border-orange focus:ring-orange/20'}`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
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
            {loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href="/giris"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-orange"
          >
            <ArrowLeft size={14} />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  )
}
