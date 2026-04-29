'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { paymentsApi } from '@/domains/payments/payments.api'

function CodContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [error, setError] = useState<string | null>(
    !orderId ? 'Geçersiz sipariş.' : null
  )

  useEffect(() => {
    if (!orderId) return

    paymentsApi
      .codConfirm({ orderId: Number(orderId) })
      .then((order) => {
        router.replace(`/odeme/basarili?orderNumber=${order.orderNumber}`)
      })
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg ?? 'Sipariş onaylanamadı. Lütfen tekrar deneyin.')
      })
  }, [orderId, router])

  if (error) {
    return (
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-navy-dark mb-2">Sipariş Onaylanamadı</h1>
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
      <h1 className="text-xl font-extrabold text-navy-dark mb-2">Siparişiniz Onaylanıyor</h1>
      <p className="text-sm text-gray-500">Lütfen bekleyin…</p>
    </div>
  )
}

export default function CodPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <Loader2 size={36} className="text-orange animate-spin mx-auto" />
      </div>
    }>
      <CodContent />
    </Suspense>
  )
}
