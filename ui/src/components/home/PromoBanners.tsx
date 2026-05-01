import Link from 'next/link'
import { ArrowRight, Sparkles, Tag, Zap } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    eyebrow: 'Kadın Giyim',
    title: 'Yeni Sezon\nKoleksiyonu',
    desc: 'Bahar&apos;ın en trend parçaları',
    cta: 'Alışverişe Başla',
    href: '/urunler?yeni=true',
    bg: 'from-[#9b2157] via-[#c0375a] to-[#e25c6a]',
    icon: Sparkles,
    iconBg: 'bg-white/15',
    pattern: 'circles',
  },
  {
    id: 2,
    eyebrow: 'Erkek Giyim',
    title: 'Stil & Konfor\nBir Arada',
    desc: 'Urban & Casual koleksiyonu',
    cta: 'Keşfet',
    href: '/urunler',
    bg: 'from-[#1a2a6c] via-[#1e3a8a] to-[#2563eb]',
    icon: Zap,
    iconBg: 'bg-white/15',
    pattern: 'lines',
  },
  {
    id: 3,
    eyebrow: 'Flaş Fırsat',
    title: '%50\'ye Varan\nİndirimler',
    desc: 'Stoklar tükenmeden kaçırmayın',
    cta: 'İndirimlere Git',
    href: '/urunler?indirim=true',
    bg: 'from-[#92400e] via-[#b45309] to-[#f59e0b]',
    icon: Tag,
    iconBg: 'bg-white/15',
    pattern: 'dots',
  },
]

export function PromoBanners() {
  return (
    <section className="py-6">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BANNERS.map((banner) => {
            const Icon = banner.icon
            return (
              <Link
                key={banner.id}
                href={banner.href}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.bg}
                            h-[200px] sm:h-[220px] flex flex-col justify-between p-5
                            group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200`}
              >
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/8
                                  -translate-y-1/3 translate-x-1/3" />
                  <div className="absolute right-6 bottom-6 w-28 h-28 rounded-full bg-white/5" />
                  <div className="absolute left-1/2 top-1/2 w-64 h-64 rounded-full bg-white/4
                                  -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Top: icon + eyebrow */}
                <div className="relative flex items-center gap-2">
                  <div className={`${banner.iconBg} backdrop-blur-sm w-8 h-8 rounded-xl
                                  flex items-center justify-center border border-white/20`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-extrabold text-white/70 uppercase tracking-widest">
                    {banner.eyebrow}
                  </span>
                </div>

                {/* Middle: title */}
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight
                                 whitespace-pre-line drop-shadow-sm">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">{banner.desc}</p>
                </div>

                {/* Bottom: CTA */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-white/90
                                  group-hover:gap-3 transition-all duration-200">
                    {banner.cta}
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center
                                    group-hover:bg-white/30 transition-colors">
                      <ArrowRight size={12} className="text-white" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
