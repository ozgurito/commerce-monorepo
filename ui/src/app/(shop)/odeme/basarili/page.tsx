import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Package, Truck, Home, ArrowRight, Clock, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sipariş Alındı | AlışverişNoktan',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{ orderNumber?: string }>
}

export default async function BasariliPage({ searchParams }: Props) {
  const { orderNumber } = await searchParams

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[560px]">

        {/* ── Success animation card ── */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden
                        shadow-[0_8px_48px_rgba(0,0,0,.08)]">

          {/* Green top bar */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center
                          relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-8 -left-8 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
            <div className="absolute top-4 right-8 w-8 h-8 bg-white/10 rounded-full" />

            {/* Icon */}
            <div className="relative w-20 h-20 bg-white rounded-full flex items-center
                            justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 size={44} className="text-green-500" />
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-1">
              Siparişiniz Alındı! 🎉
            </h1>
            <p className="text-green-100 text-sm">
              Teşekkürler! Siparişiniz başarıyla oluşturuldu.
            </p>

            {orderNumber && (
              <div className="mt-4 bg-white/10 rounded-2xl px-5 py-3 inline-block">
                <p className="text-green-100 text-xs mb-0.5">Sipariş Numaranız</p>
                <p className="text-white font-extrabold text-xl tracking-wider">
                  #{orderNumber}
                </p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">

            {/* What happens next */}
            <h2 className="text-sm font-extrabold text-navy-dark">Sıradaki Adımlar</h2>

            <div className="space-y-3">
              {[
                {
                  icon: Clock,
                  color: 'bg-blue-50 text-blue-500',
                  title: 'Sipariş Onayı',
                  desc: 'Siparişiniz onaylandı, ödemeniz işleme alındı.',
                },
                {
                  icon: Package,
                  color: 'bg-purple-50 text-purple-500',
                  title: 'Hazırlanıyor',
                  desc: 'Ekibimiz siparişinizi en kısa sürede hazırlayacak.',
                },
                {
                  icon: Truck,
                  color: 'bg-orange-50 text-orange',
                  title: 'Kargoya Verilecek',
                  desc: '1-3 iş günü içinde kargoya verilecek ve bildirim alacaksınız.',
                },
                {
                  icon: Home,
                  color: 'bg-green-50 text-green-600',
                  title: 'Teslimat',
                  desc: 'Ürününüz belirlenen adrese teslim edilecek.',
                },
              ].map(({ icon: Icon, color, title, desc }, i) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="flex-shrink-0 relative">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon size={16} />
                    </div>
                    {i < 3 && (
                      <div className="absolute left-1/2 top-full w-0.5 h-3 bg-gray-100
                                      -translate-x-1/2 mt-1" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <p className="text-sm font-bold text-navy-dark">{title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Support note */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3">
              <Phone size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500">
                Siparişinizle ilgili sorularınız için{' '}
                <span className="font-semibold text-navy-dark">destek@alisverisNoktan.com</span>
                {' '}adresine yazabilirsiniz.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              {orderNumber && (
                <Link
                  href="/hesabim/siparislerim"
                  className="flex-1 flex items-center justify-center gap-2 bg-orange
                             hover:bg-orange-dark text-white font-bold py-3 rounded-xl
                             transition-colors text-sm shadow-md shadow-orange/20"
                >
                  <Package size={16} />
                  Siparişimi Görüntüle
                </Link>
              )}
              <Link
                href="/urunler"
                className="flex-1 flex items-center justify-center gap-2 bg-white border
                           border-gray-200 hover:border-orange text-navy-dark font-semibold
                           py-3 rounded-xl transition-colors text-sm"
              >
                Alışverişe Devam Et
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Sipariş durumunuzu{' '}
          <Link href="/hesabim/siparislerim" className="text-orange hover:underline font-semibold">
            Hesabım → Siparişlerim
          </Link>
          {' '}bölümünden takip edebilirsiniz.
        </p>
      </div>
    </div>
  )
}
