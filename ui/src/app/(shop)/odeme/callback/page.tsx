'use client'
import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const status = searchParams.get('status')
    const orderNumber = searchParams.get('orderNumber')

    if (status === 'success' && orderNumber) {
      router.replace(`/odeme/basarili?orderNumber=${orderNumber}`)
    } else if (orderNumber) {
      router.replace(`/odeme/basarisiz?orderNumber=${orderNumber}`)
    } else {
      router.replace('/odeme/basarisiz')
    }
  }, [searchParams, router])

  return (
    <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
      <div className="flex justify-center mb-5">
        <Loader2 size={36} className="text-orange animate-spin" />
      </div>
      <h1 className="text-xl font-extrabold text-navy-dark mb-2">İşleminiz Tamamlanıyor</h1>
      <p className="text-sm text-gray-500">Yönlendiriliyorsunuz, lütfen bekleyin…</p>
    </div>
  )
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="max-w-[480px] mx-auto px-5 py-20 text-center">
        <Loader2 size={36} className="text-orange animate-spin mx-auto" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
