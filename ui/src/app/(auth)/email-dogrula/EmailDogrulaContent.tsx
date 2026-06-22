'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { authApi } from '@/domains/auth/auth.api'

type State = 'loading' | 'success' | 'invalid' | 'expired' | 'used' | 'error'

function getStateFromError(err: unknown): State {
  const msg: string =
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? ''

  if (msg.includes('süresi dolmuş')) return 'expired'
  if (msg.includes('zaten kullanılmış')) return 'used'
  if (msg.includes('Geçersiz')) return 'invalid'
  return 'error'
}

export function EmailDogrulaContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<State>('loading')

  useEffect(() => {
    if (!token) {
      setState('invalid')
      return
    }
    authApi.verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => setState(getStateFromError(err)))
  }, [token])

  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center py-8 gap-3">
        <Loader2 size={32} className="text-orange animate-spin" />
        <p className="text-sm text-gray-500">Doğrulanıyor…</p>
      </div>
    )
  }

  if (state === 'success') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-navy-dark mb-2">E-posta Doğrulandı!</h2>
        <p className="text-sm text-gray-500 mb-6">
          Hesabınız aktif. Artık giriş yapabilirsiniz.
        </p>
        <Link
          href="/giris"
          className="inline-block bg-orange hover:bg-orange-dark text-white font-bold
                     px-8 py-3 rounded-xl transition-colors text-sm"
        >
          Giriş Yap
        </Link>
      </div>
    )
  }

  if (state === 'expired') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-yellow-500" />
        </div>
        <h2 className="text-xl font-extrabold text-navy-dark mb-2">Bağlantı Süresi Doldu</h2>
        <p className="text-sm text-gray-500 mb-6">
          Doğrulama bağlantısı 24 saat geçerlidir. Yeni bir bağlantı talep edin.
        </p>
        <Link
          href="/email-dogrulama-gonderildi"
          className="inline-block border border-orange text-orange font-bold
                     px-8 py-3 rounded-xl hover:bg-orange/5 transition-colors text-sm"
        >
          Yeni Bağlantı İste
        </Link>
      </div>
    )
  }

  if (state === 'used') {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-navy-dark mb-2">Zaten Doğrulandı</h2>
        <p className="text-sm text-gray-500 mb-6">
          Bu bağlantı daha önce kullanıldı. Hesabınız zaten aktif.
        </p>
        <Link
          href="/giris"
          className="inline-block bg-orange hover:bg-orange-dark text-white font-bold
                     px-8 py-3 rounded-xl transition-colors text-sm"
        >
          Giriş Yap
        </Link>
      </div>
    )
  }

  // invalid | error
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <XCircle size={32} className="text-red-400" />
      </div>
      <h2 className="text-xl font-extrabold text-navy-dark mb-2">Geçersiz Bağlantı</h2>
      <p className="text-sm text-gray-500 mb-6">
        Doğrulama bağlantısı geçersiz veya kullanılamıyor.
      </p>
      <Link
        href="/email-dogrulama-gonderildi"
        className="inline-block border border-orange text-orange font-bold
                   px-8 py-3 rounded-xl hover:bg-orange/5 transition-colors text-sm"
      >
        Yeni Bağlantı İste
      </Link>
    </div>
  )
}
