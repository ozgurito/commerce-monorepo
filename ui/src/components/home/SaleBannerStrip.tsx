import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Truck, RotateCcw, Shield } from 'lucide-react'

export function SaleBannerStrip() {
  return (
    <section className="py-6">
      <div className="max-w-[1280px] mx-auto px-5">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-navy-dark">Avantajlarımız</h2>
            <p className="text-xs text-gray-400 mt-0.5">Alışverişin keyfini çıkar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Sol: İndirim bandı — fotoğraflı */}
          <Link
            href="/urunler?indirim=true"
            className="relative overflow-hidden rounded-2xl h-[140px] flex items-center
                       group hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="absolute inset-0">
              <Image
                src="/images/sale-banner-indirim.png"
                alt="İndirimli ürünler"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
            </div>
            <div className="relative px-6">
              <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">Flaş Fırsat</p>
              <h3 className="text-2xl font-extrabold text-white leading-tight">
                %50&apos;ye Varan<br />İndirim
              </h3>
              <div className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white
                              bg-orange px-4 py-1.5 rounded-xl group-hover:bg-orange/90 transition-colors">
                Hemen Keşfet <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          {/* Sağ: Güven bandı — lacivert tekstür arka plan */}
          <div className="relative rounded-2xl h-[140px] flex items-center px-6 overflow-hidden">
            <div className="absolute inset-0">
              <Image
                src="/images/sale-banner-guven.png"
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-[#0d1a40]/60" />
            </div>
            <div className="relative grid grid-cols-3 gap-4 w-full">
              {[
                { icon: Truck,       title: 'Ücretsiz Kargo',  desc: '150₺ üzeri tüm siparişlerde' },
                { icon: RotateCcw,   title: '30 Gün İade',     desc: 'Kolay ve ücretsiz iade' },
                { icon: Shield,      title: 'Güvenli Ödeme',   desc: '256-bit SSL şifreleme' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center text-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon size={18} className="text-orange" />
                  </div>
                  <p className="text-white text-[11px] font-extrabold leading-tight">{title}</p>
                  <p className="text-white/50 text-[10px] leading-tight hidden sm:block">{desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

