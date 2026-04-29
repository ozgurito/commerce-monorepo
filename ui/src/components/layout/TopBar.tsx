'use client'
import Link from 'next/link'
import { Truck, RotateCcw, Shield, Phone } from 'lucide-react'

const TICKER_ITEMS = [
  { icon: Truck,      text: 'Ücretsiz kargo',    highlight: '500₺ ve üzeri' },
  { icon: RotateCcw,  text: 'Kolay iade',         highlight: '30 gün' },
  { icon: Shield,     text: 'Güvenli ödeme',      highlight: '256-bit SSL' },
  { icon: Phone,      text: 'Müşteri hattı',      highlight: '0850 123 45 67' },
  { icon: Truck,      text: 'Ücretsiz kargo',    highlight: '500₺ ve üzeri' },
  { icon: RotateCcw,  text: 'Kolay iade',         highlight: '30 gün' },
  { icon: Shield,     text: 'Güvenli ödeme',      highlight: '256-bit SSL' },
  { icon: Phone,      text: 'Müşteri hattı',      highlight: '0850 123 45 67' },
]

export function TopBar() {
  return (
    <div className="bg-navy-dark h-[34px] flex items-center overflow-hidden relative">
      {/* Marquee ticker */}
      <div className="flex items-center animate-[marquee_32s_linear_infinite] whitespace-nowrap flex-shrink-0">
        {TICKER_ITEMS.map((item, i) => {
          const Icon = item.icon
          return (
            <div
              key={i}
              className="text-[11.5px] font-semibold text-white/80 px-9 flex items-center gap-[7px] border-r border-white/10 flex-shrink-0"
            >
              <Icon size={12} className="opacity-75 flex-shrink-0" />
              {item.text}{' '}
              <strong className="text-amber-400">{item.highlight}</strong>
            </div>
          )
        })}
      </div>

      {/* Right links */}
      <div className="absolute right-5 top-0 bottom-0 flex items-center gap-[14px] bg-navy-dark pl-6
                      before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0
                      before:w-8 before:bg-gradient-to-r before:from-transparent before:to-navy-dark">
        <Link href="/hakkimizda" className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors">
          Hakkımızda
        </Link>
        <span className="text-white/20">|</span>
        <Link href="/kargo-takip" className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors">
          Kargo Takip
        </Link>
        <span className="text-white/20">|</span>
        <Link href="/iletisim" className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors">
          İletişim
        </Link>
      </div>
    </div>
  )
}
