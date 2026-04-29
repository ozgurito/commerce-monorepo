import { Truck, RotateCcw, Shield, Headphones } from 'lucide-react'

const PROMOS = [
  {
    Icon: Truck,
    title: 'Ücretsiz Kargo',
    desc: '150 TL ve üzeri tüm siparişlerde',
  },
  {
    Icon: RotateCcw,
    title: 'Kolay İade',
    desc: '30 gün içinde ücretsiz iade',
  },
  {
    Icon: Shield,
    title: 'Güvenli Ödeme',
    desc: '256-bit SSL ile korunan işlemler',
  },
  {
    Icon: Headphones,
    title: '7/24 Destek',
    desc: 'Her zaman yanınızdayız',
  },
]

export function PromoStrip() {
  return (
    <section className="bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-5 py-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PROMOS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-light flex items-center justify-center">
                <Icon size={20} className="text-orange" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-navy-dark">{title}</p>
                <p className="text-[11px] text-gray-500 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
