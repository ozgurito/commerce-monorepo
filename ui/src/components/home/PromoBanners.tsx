import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    badge: 'Kadın',
    title: 'Yeni Sezon\nKadın Giyim',
    cta: 'Alışverişe Başla',
    href: '/urunler?gender=KADIN&yeni=true',
    bg: 'from-rose-400 via-pink-500 to-fuchsia-600',
  },
  {
    id: 2,
    badge: 'Erkek',
    title: 'Erkek\nKoleksiyonu',
    cta: 'Keşfet',
    href: '/urunler?gender=ERKEK',
    bg: 'from-blue-500 via-indigo-600 to-violet-700',
  },
]

export function PromoBanners() {
  return (
    <section className="py-6">
      <div className="max-w-[1280px] mx-auto px-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {BANNERS.map((banner) => (
            <Link
              key={banner.id}
              href={banner.href}
              className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.bg}
                          h-[200px] sm:h-[240px] flex flex-col justify-end p-6
                          group hover:shadow-hover transition-shadow`}
            >
              {/* Decorative circle */}
              <div className="absolute right-0 top-0 w-52 h-52 rounded-full bg-white/10
                              -translate-y-1/3 translate-x-1/3 pointer-events-none" />
              <div className="absolute right-8 bottom-8 w-32 h-32 rounded-full bg-white/5
                              pointer-events-none" />

              <span className="inline-block mb-2 text-xs font-bold text-white/70 uppercase tracking-widest">
                {banner.badge}
              </span>
              <h3 className="text-2xl font-extrabold text-white leading-tight whitespace-pre-line">
                {banner.title}
              </h3>
              <div className="mt-4 flex items-center gap-2 text-sm font-bold text-white/90
                              group-hover:gap-3 transition-all">
                {banner.cta}
                <ArrowRight size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
