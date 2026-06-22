'use client'
import { useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { authApi } from '@/domains/auth/auth.api'

interface Props {
  email: string
}

export function ResendVerificationButton({ email }: Props) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleResend = async () => {
    if (!email) {
      setError('E-posta adresi bulunamadı. Lütfen tekrar kayıt olun.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authApi.resendVerification(email)
      setSent(true)
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex items-center justify-center gap-2 text-green-600 text-sm">
        <CheckCircle2 size={16} />
        <span>Yeni bağlantı gönderildi</span>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleResend}
        disabled={loading}
        className="w-full border border-orange text-orange font-bold py-2.5 rounded-xl
                   hover:bg-orange/5 transition-colors disabled:opacity-60
                   flex items-center justify-center gap-2 text-sm"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Gönderiliyor…' : 'Tekrar Gönder'}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </>
  )
}
