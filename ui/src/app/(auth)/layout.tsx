import Link from 'next/link'
import { Shield, Truck, RotateCcw, Star } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: Shield,    text: 'Güvenli alışveriş' },
  { icon: Truck,     text: 'Hızlı teslimat' },
  { icon: RotateCcw, text: '14 gün iade garantisi' },
  { icon: Star,      text: '100.000+ mutlu müşteri' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Brand panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-shrink-0
                      bg-gradient-to-br from-navy-dark via-navy to-[#1e3a5f]
                      flex-col justify-between p-10 xl:p-14 relative overflow-hidden">

        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full
                          bg-white/5 -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full
                          bg-orange/10 translate-y-1/3 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full
                          bg-white/3 -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Logo */}
        <div className="relative">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange flex items-center justify-center
                            shadow-lg shadow-orange/30">
              <svg viewBox="0 0 42 42" fill="none" className="w-7 h-7">
                <path d="M21 8L30 14V22C30 27.5 26 32.2 21 34C16 32.2 12 27.5 12 22V14L21 8Z"
                      fill="white" fillOpacity="0.3" />
                <path d="M15 20H27M21 14V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex items-baseline leading-none">
              <span className="text-[22px] font-black text-white tracking-tight">Alışveriş</span>
              <span className="text-[22px] font-black text-orange tracking-tight">Noktan</span>
            </div>
          </Link>
        </div>

        {/* Main pitch */}
        <div className="relative space-y-4">
          <h2 className="text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold text-white leading-tight">
            Türkiye&apos;nin<br />
            <span className="text-orange">en sevilen</span><br />
            giyim mağazası
          </h2>
          <p className="text-white/60 text-base leading-relaxed max-w-[320px]">
            Binlerce ürün, uygun fiyatlar ve hızlı teslimat ile alışverişin tadını çıkarın.
          </p>

          {/* Trust items */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            {TRUST_ITEMS.map(({ icon: Icon, text }) => (
              <div key={text}
                className="flex items-center gap-2.5 bg-white/8 backdrop-blur-sm
                           rounded-xl p-3 border border-white/10">
                <Icon size={16} className="text-orange flex-shrink-0" />
                <span className="text-white/80 text-xs font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div className="relative flex items-center gap-6 text-center">
          {[
            { val: '500+', label: 'Ürün' },
            { val: '10K+', label: 'Sipariş' },
            { val: '%98',  label: 'Memnuniyet' },
          ].map(({ val, label }) => (
            <div key={label}>
              <p className="text-2xl font-extrabold text-white">{val}</p>
              <p className="text-xs text-white/50 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center justify-center py-6 bg-navy">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-white">Alışveriş</span>
            <span className="text-xl font-black text-orange">Noktan</span>
          </Link>
        </div>

        {/* Center the form */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>

        {/* Bottom links */}
        <div className="py-5 px-6 text-center border-t border-gray-100 bg-white">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} AlışverişNoktan •{' '}
            <Link href="/gizlilik" className="hover:text-gray-600 transition-colors">Gizlilik</Link>
            {' '}•{' '}
            <Link href="/kullanim-kosullari" className="hover:text-gray-600 transition-colors">Kullanım Koşulları</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
