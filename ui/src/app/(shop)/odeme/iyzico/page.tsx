'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { paymentsApi } from '@/domains/payments/payments.api'

function IyzicoContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [error, setError] = useState<string | null>(
    !orderId ? 'Geçersiz sipariş.' : null
  )

  useEffect(() => {
    if (!orderId) return

    paymentsApi
      .iyzicoInit({ orderId: Number(orderId) })
      .then((res) => {
        window.location.href = res.paymentPageUrl
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg ?? 'Ödeme başlatılamadı. Lütfen tekrar deneyin.')
      })
  }, [orderId])

  if (error) {
    return (
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-navy-dark mb-2">Ödeme Başlatılamadı</h1>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <a
          href="/odeme"
          className="inline-block bg-orange hover:bg-orange-dark text-white font-bold
                     px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Ödeme Sayfasına Dön
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
      <div className="flex justify-center mb-5">
        <Loader2 size={36} className="text-orange animate-spin" />
      </div>
      <h1 className="text-xl font-extrabold text-navy-dark mb-2">
        Ödeme Sayfasına Yönlendiriliyorsunuz
      </h1>
      <p className="text-sm text-gray-500">
        Lütfen bekleyin, iyzico ödeme sayfasına aktarılıyorsunuz…
      </p>
    </div>
  )
}

export default function IyzicoPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <Loader2 size={36} className="text-orange animate-spin mx-auto" />
      </div>
    }>
      <IyzicoContent />
    </Suspense>
  )
}
