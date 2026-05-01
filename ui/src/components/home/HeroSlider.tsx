'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Truck, Tag, Zap, Shield } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    badge: 'Yeni Sezon 2025',
    badgeCls: 'bg-orange text-white',
    title: 'Bahar & Yaz\nKoleksiyonu',
    subtitle: 'Tarzını yenile, özgüvenini tazele. En yeni parçalar seni bekliyor.',
    cta: 'Koleksiyonu Keşfet',
    href: '/urunler?yeni=true',
    bg: 'from-[#1a2240] via-[#1e2a55] to-[#243060]',
    visual: 'new-season' as const,
  },
  {
    id: 2,
    badge: '%50\'ye Varan İndirim',
    badgeCls: 'bg-white text-red-600',
    title: 'Sezon Sonu\nFırsatları',
    subtitle: 'Binlerce üründe kaçırılmayacak fırsatlar. Stoklar tükenmeden kaçırmayın!',
    cta: 'İndirimlere Göz At',
    href: '/urunler?indirim=true',
    bg: 'from-[#7f1d1d] via-[#b91c1c] to-[#c2410c]',
    visual: 'discount' as const,
  },
  {
    id: 3,
    badge: 'Özel Koleksiyon',
    badgeCls: 'bg-amber-400 text-navy-dark',
    title: 'Premium\nKalite',
    subtitle: 'Seçkin kumaşlar ve özenli işçilik ile hazırlanan premium koleksiyonumuz.',
    cta: 'Şimdi Alışveriş Yap',
    href: '/urunler',
    bg: 'from-[#0f1923] via-[#1a2535] to-[#0f3460]',
    visual: 'premium' as const,
  },
]

function NewSeasonVisual() {
  const items = [
    { cat: 'T-Shirt', color: 'bg-gradient-to-br from-blue-400 to-indigo-500', price: '₺199', tag: 'YENİ', emoji: '👕' },
    { cat: 'Hoodie',  color: 'bg-gradient-to-br from-purple-400 to-pink-500',  price: '₺449', tag: 'YENİ', emoji: '🧥' },
    { cat: 'Sweatshirt', color: 'bg-gradient-to-br from-green-400 to-teal-500', price: '₺349', tag: 'YENİ', emoji: '👚' },
    { cat: 'Tank Top',   color: 'bg-gradient-to-br from-orange-400 to-red-400', price: '₺149', tag: 'YENİ', emoji: '🧴' },
  ]
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute w-[360px] h-[360px] rounded-full bg-white/5 -right-16 top-1/2 -translate-y-1/2" />
      <div className="absolute w-[220px] h-[220px] rounded-full bg-white/8 right-20 top-1/2 -translate-y-1/2" />
      <div className="relative z-10 grid grid-cols-2 gap-2.5 p-4">
        {items.map((item, i) => (
          <div key={i}
            className="bg-white/12 backdrop-blur-md rounded-2xl p-3 w-[130px]
                       border border-white/20 hover:bg-white/20 transition-all duration-200
                       hover:scale-105 hover:shadow-lg">
            <div className={`h-[70px] ${item.color} rounded-xl mb-2.5 flex items-center
                            justify-center text-3xl shadow-inner`}>
              {item.emoji}
            </div>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-white text-xs font-bold truncate">{item.cat}</p>
              <span className="text-[9px] bg-orange text-white px-1.5 py-0.5 rounded-full font-extrabold ml-1 flex-shrink-0">
                {item.tag}
              </span>
            </div>
            <p className="text-white/75 text-[11px] font-semibold">{item.price}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function DiscountVisual() {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute w-[400px] h-[400px] rounded-full bg-white/5 -right-20 top-1/2 -translate-y-1/2" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        {/* Big percentage */}
        <div className="text-center">
          <p className="text-white/60 text-xs font-black uppercase tracking-[0.3em] mb-1">Fırsatlar</p>
          <div className="flex items-start leading-none">
            <span className="text-6xl sm:text-8xl lg:text-9xl font-extrabold text-white drop-shadow-lg">%50</span>
          </div>
          <p className="text-white/80 text-base sm:text-lg font-bold tracking-wide">İNDİRİM</p>
        </div>
        {/* Category tags */}
        <div className="flex gap-2 flex-wrap justify-center">
          {['T-Shirt', 'Hoodie', 'Sweatshirt', 'Denim'].map((cat) => (
            <span key={cat}
              className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full
                         border border-white/30 backdrop-blur-sm">
              {cat}
            </span>
          ))}
        </div>
        {/* Info strip */}
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-2.5
                        border border-white/20">
          <Truck size={14} className="text-white flex-shrink-0" />
          <span className="text-white text-xs font-semibold">150₺ üzeri ücretsiz kargo</span>
        </div>
      </div>
    </div>
  )
}

function PremiumVisual() {
  const stats = [
    { val: '★★★★★', label: 'Kumaş Kalitesi' },
    { val: '%98',    label: 'Memnuniyet' },
    { val: '500+',   label: 'Ürün Çeşidi' },
    { val: '30 gün', label: 'İade Süresi' },
  ]
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      <div className="absolute w-[360px] h-[360px] rounded-full bg-white/4 -right-16 top-1/2 -translate-y-1/2" />
      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Badge */}
        <div className="relative">
          <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-br from-amber-400 to-orange
                          flex items-center justify-center shadow-xl shadow-orange/30">
            <Shield size={38} className="text-white fill-white/20" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center
                          justify-center border-2 border-slate-800">
            <span className="text-[9px] font-black text-white">✓</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-extrabold tracking-tight">Premium</p>
          <p className="text-white/60 text-sm">Kalite Garantili</p>
        </div>
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          {stats.map((item) => (
            <div key={item.label}
              className="bg-white/12 backdrop-blur-sm rounded-xl px-3.5 py-2.5 text-center
                         border border-white/20 hover:bg-white/20 transition-colors">
              <p className="text-white font-extrabold text-sm">{item.val}</p>
              <p className="text-white/55 text-[10px] leading-tight mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const VISUALS = {
  'new-season': NewSeasonVisual,
  'discount':   DiscountVisual,
  'premium':    PremiumVisual,
}

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), [])

  useEffect(() => {
    if (isPaused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [isPaused, next])

  const slide = SLIDES[current]
  const Visual = VISUALS[slide.visual]

  return (
    <div
      className="relative overflow-hidden"
      style={{ height: 'clamp(380px, 52vw, 560px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Animated background */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-opacity duration-700
                      ${i === current ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Subtle noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")' }} />

      {/* Content — 2 columns */}
      <div className="relative z-10 h-full max-w-[1280px] mx-auto px-5 sm:px-8
                      grid grid-cols-1 sm:grid-cols-[1fr_1fr] lg:grid-cols-[55%_45%] gap-0">
        {/* Left: text */}
        <div className="flex flex-col justify-center py-8 sm:py-0">
          <div key={current} className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full
                             text-xs font-extrabold tracking-wide mb-5 ${slide.badgeCls}`}>
              <Zap size={11} />
              {slide.badge}
            </span>
            <h1 className="text-[clamp(2rem,5vw,3.75rem)] font-extrabold text-white leading-[1.05]
                           whitespace-pre-line drop-shadow-sm">
              {slide.title}
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/65 max-w-[420px] leading-relaxed">
              {slide.subtitle}
            </p>
            <div className="mt-7 flex items-center gap-3 flex-wrap">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-white text-navy-dark font-extrabold
                           px-6 py-3 rounded-xl hover:bg-orange hover:text-white transition-all
                           duration-200 shadow-xl hover:shadow-orange/40 hover:-translate-y-0.5 text-sm"
              >
                {slide.cta}
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/urunler"
                className="text-white/70 text-sm font-semibold hover:text-white transition-colors
                           underline-offset-2 hover:underline"
              >
                Tüm ürünleri gör
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-4 mt-7 flex-wrap">
              {[
                { icon: Truck,  text: 'Ücretsiz kargo' },
                { icon: Shield, text: 'Güvenli ödeme' },
                { icon: Tag,    text: '30 gün iade' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
                  <Icon size={12} />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: visual — hidden on very small screens */}
        <div className="hidden sm:flex relative">
          <div key={`visual-${current}`} className="w-full animate-in fade-in duration-500">
            <Visual />
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        aria-label="Önceki slayt"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                   w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 border border-white/20
                   flex items-center justify-center text-white transition-all
                   backdrop-blur-sm hover:scale-110"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki slayt"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                   w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 border border-white/20
                   flex items-center justify-center text-white transition-all
                   backdrop-blur-sm hover:scale-110"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slayt ${i + 1}`}
            className={`rounded-full transition-all duration-300
                        ${i === current
                          ? 'w-7 h-2 bg-white'
                          : 'w-2 h-2 bg-white/35 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  )
}
