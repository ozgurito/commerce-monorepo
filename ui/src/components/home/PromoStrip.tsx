import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react'

const PROMOS = [
  {
    Icon: Truck,
    title: 'Ücretsiz Kargo',
    mobileTitle: '1000₺+ Kargo Bedava',
    desc: '1000 TL ve üzeri siparişlerde',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    Icon: RotateCcw,
    title: 'Kolay İade',
    desc: '14 gün yasal süre',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    Icon: Shield,
    title: 'Güvenli Ödeme',
    desc: '256-bit SSL korumalı',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    Icon: Headphones,
    title: '7/24 Destek',
    desc: 'Her zaman yanınızdayız',
    color: 'text-orange',
    bg: 'bg-orange-50',
  },
]

export function PromoStrip() {
  return (
    <section className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-[1280px] mx-auto px-5">

        {/* Mobil — tek satır, yatay kaydırılabilir şerit, ikon + kısa başlık (açıklama yok) */}
        <div className="sm:hidden flex gap-2.5 overflow-x-auto scrollbar-none py-3 -mx-5 px-5">
          {PROMOS.map(({ Icon, title, mobileTitle, color, bg }) => (
            <div key={title}
              className="flex-shrink-0 flex items-center gap-2 pl-2 pr-3.5 py-2 rounded-full bg-gray-50">
              <div className={`flex-shrink-0 w-7 h-7 rounded-full ${bg} flex items-center justify-center`}>
                <Icon size={14} className={color} />
              </div>
              <p className="text-[12px] font-bold text-navy-dark whitespace-nowrap">{mobileTitle ?? title}</p>
            </div>
          ))}
        </div>

        {/* Tablet/masaüstü — mevcut 4'lü grid, açıklamalı, aynen korunuyor */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {PROMOS.map(({ Icon, title, desc, color, bg }) => (
            <div key={title}
              className="flex items-center gap-3.5 py-4 px-4 hover:bg-gray-50 transition-colors
                         first:pl-0 last:pr-0 cursor-default group">
              <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${bg} flex items-center justify-center
                              group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={22} className={color} />
              </div>
              <div>
                <p className="text-[13px] font-extrabold text-navy-dark leading-tight">{title}</p>
                <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
