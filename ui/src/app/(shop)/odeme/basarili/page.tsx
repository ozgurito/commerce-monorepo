import Link from 'next/link'
import { CheckCircle2, Package, ArrowRight } from 'lucide-react'

interface Props {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function BasariliPage({ searchParams }: Props) {
  const { orderNumber } = await searchParams

  return (
    <div className="max-w-[560px] mx-auto px-5 py-16 text-center">
      {/* İkon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
          <CheckCircle2 size={44} className="text-green-500" />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-navy-dark mb-3">
        Siparişiniz Alındı!
      </h1>
      <p className="text-gray-500 text-sm mb-2">
        Teşekkürler! Siparişiniz başarıyla oluşturuldu.
      </p>
      {orderNumber && (
        <p className="text-sm font-semibold text-gray-700 mb-8">
          Sipariş No:{' '}
          <span className="text-orange font-extrabold">{orderNumber}</span>
        </p>
      )}

      {/* Bilgi kartı */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3">
        <div className="flex items-start gap-3">
          <Package size={18} className="text-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-navy-dark">Hazırlanıyor</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Siparişiniz en kısa sürede hazırlanıp kargoya verilecektir.
            </p>
          </div>
        </div>
      </div>

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderNumber && (
          <Link
            href={`/hesabim/siparisler`}
            className="flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                       text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            Siparişimi Görüntüle
            <ArrowRight size={16} />
          </Link>
        )}
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-white border border-gray-200
                     hover:border-orange text-navy-dark font-semibold px-6 py-3 rounded-xl
                     transition-colors text-sm"
        >
          Alışverişe Devam Et
        </Link>
      </div>
    </div>
  )
}
