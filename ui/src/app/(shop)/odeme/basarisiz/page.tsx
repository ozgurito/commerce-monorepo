import Link from 'next/link'
import { XCircle, RefreshCw, ArrowLeft } from 'lucide-react'

interface Props {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function BasarisizPage({ searchParams }: Props) {
  const { orderNumber } = await searchParams

  return (
    <div className="max-w-[560px] mx-auto px-5 py-16 text-center">
      {/* İkon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <XCircle size={44} className="text-red-400" />
        </div>
      </div>

      <h1 className="text-2xl font-extrabold text-navy-dark mb-3">
        Ödeme Başarısız
      </h1>
      <p className="text-gray-500 text-sm mb-2">
        Ödeme işleminiz tamamlanamadı. Kart bilgilerinizi kontrol ederek tekrar deneyebilirsiniz.
      </p>
      {orderNumber && (
        <p className="text-sm text-gray-400 mb-8">
          Sipariş No: <span className="font-semibold">{orderNumber}</span>
        </p>
      )}

      {/* Olası sebepler */}
      <div className="bg-red-50 border border-red-100 rounded-2xl p-5 mb-8 text-left">
        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">
          Olası Sebepler
        </p>
        <ul className="space-y-1.5">
          {[
            'Yetersiz bakiye',
            'Kart bilgilerinde hata',
            '3D Secure doğrulaması başarısız',
            'Bankanız işlemi reddetti',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2 text-xs text-red-700">
              <span className="w-1 h-1 rounded-full bg-red-400 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Butonlar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/odeme"
          className="flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                     text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          <RefreshCw size={16} />
          Tekrar Dene
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 bg-white border border-gray-200
                     hover:border-gray-300 text-navy-dark font-semibold px-6 py-3 rounded-xl
                     transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
