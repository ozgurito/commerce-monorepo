'use client'
import Link from 'next/link'
import { Truck, RotateCcw, Shield, Phone } from 'lucide-react'

const TICKER_ITEMS = [
  { icon: Truck,      text: 'Ücretsiz kargo',  highlight: '1000₺ ve üzeri' },
  { icon: RotateCcw,  text: 'Kolay iade',       highlight: '14 gün yasal süre' },
  { icon: Shield,     text: 'Güvenli ödeme',    highlight: '256-bit SSL' },
  { icon: Phone,      text: 'Müşteri hattı',    highlight: '0541 877 16 35', href: 'tel:+905418771635' },
  { icon: Truck,      text: 'Ücretsiz kargo',  highlight: '1000₺ ve üzeri' },
  { icon: RotateCcw,  text: 'Kolay iade',       highlight: '14 gün yasal süre' },
  { icon: Shield,     text: 'Güvenli ödeme',    highlight: '256-bit SSL' },
  { icon: Phone,      text: 'Müşteri hattı',    highlight: '0541 877 16 35', href: 'tel:+905418771635' },
]

export function TopBar() {
  return (
    <div className="bg-navy-dark h-[34px] flex items-center overflow-hidden relative w-full">
      {/* Scrolling ticker */}
      <div className="flex items-center animate-[marquee_32s_linear_infinite] whitespace-nowrap flex-shrink-0">
        {TICKER_ITEMS.map((item, i) => {
          const Icon = item.icon
          const className = "text-[11.5px] font-semibold text-white/80 px-9 flex items-center " +
                            "gap-[7px] border-r border-white/10 flex-shrink-0"
          const content = (
            <>
              <Icon size={12} className="opacity-70 flex-shrink-0" />
              {item.text}{' '}
              <strong className="text-amber-400">{item.highlight}</strong>
            </>
          )
          return item.href ? (
            <a key={i} href={item.href} className={className + ' hover:text-white transition-colors'}>
              {content}
            </a>
          ) : (
            <div key={i} className={className}>
              {content}
            </div>
          )
        })}
      </div>

      {/* Right links — mobilde gizle (MobileBottomNav yeterli) */}
      <div className="absolute right-0 top-0 bottom-0 hidden sm:flex items-center gap-3
                      px-4 sm:px-6 lg:px-10 xl:px-14 bg-navy-dark
                      before:content-[''] before:absolute before:left-0 before:top-0
                      before:bottom-0 before:w-10 before:bg-gradient-to-r
                      before:from-transparent before:to-navy-dark">
        <Link href="/hakkimizda"
          className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors whitespace-nowrap">
          Hakkımızda
        </Link>
        <span className="text-white/20 text-xs">|</span>
        <Link href="/kargo-takip"
          className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors whitespace-nowrap">
          Kargo Takip
        </Link>
        <span className="text-white/20 text-xs">|</span>
        <Link href="/iletisim"
          className="text-[11px] font-semibold text-white/60 hover:text-white transition-colors whitespace-nowrap">
          İletişim
        </Link>
      </div>
    </div>
  )
}
