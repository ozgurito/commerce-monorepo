'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, AlertCircle } from 'lucide-react'
import { paymentsApi } from '@/domains/payments/payments.api'
import { BankTransferInfo } from '@/components/checkout/BankTransferInfo'
import type { BankTransferInitResponse } from '@/domains/payments/payments.types'

function HavaleContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [info, setInfo] = useState<BankTransferInitResponse | null>(null)
  const [error, setError] = useState<string | null>(
    !orderId ? 'Geçersiz sipariş.' : null
  )
  const [loading, setLoading] = useState(!!orderId)

  useEffect(() => {
    if (!orderId) return

    paymentsApi
      .bankTransferInit({ orderId: Number(orderId) })
      .then((res) => setInfo(res))
      .catch((err: unknown) => {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        setError(msg ?? 'Havale bilgileri alınamadı.')
      })
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <Loader2 size={36} className="text-orange animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Havale bilgileri yükleniyor…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle size={28} className="text-red-500" />
          </div>
        </div>
        <h1 className="text-xl font-extrabold text-navy-dark mb-2">Bir Hata Oluştu</h1>
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

  if (!info) return null

  return (
    <div className="max-w-[560px] mx-auto px-5 py-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-navy-dark mb-2">Havale / EFT Bilgileri</h1>
        <p className="text-sm text-gray-500">
          Sipariş No: <span className="font-bold text-navy-dark">{info.orderNumber}</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <BankTransferInfo info={info} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Transfer sonrası siparişiniz otomatik olarak onaylanacaktır.
      </p>
    </div>
  )
}

export default function HavalePage() {
  return (
    <Suspense fallback={
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <Loader2 size={36} className="text-orange animate-spin mx-auto" />
      </div>
    }>
      <HavaleContent />
    </Suspense>
  )
}
