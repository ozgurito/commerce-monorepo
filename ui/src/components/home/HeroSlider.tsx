'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    badge: 'Yeni Sezon',
    title: 'Bahar & Yaz\nKoleksiyonu',
    subtitle: 'Tarzını yenile, özgüvenini tazele. En yeni parçalar seni bekliyor.',
    cta: 'Koleksiyonu Keşfet',
    href: '/urunler?yeni=true',
    bg: 'from-navy-dark via-navy to-navy-light',
    accent: 'bg-orange',
    image: null,
  },
  {
    id: 2,
    badge: '%50\'ye Varan İndirim',
    title: 'Sezon Sonu\nFırsatları',
    subtitle: 'Binlerce üründe kaçırılmayacak indirimler. Stoklar tükenmeden kaçırmayın!',
    cta: 'İndirimlere Göz At',
    href: '/urunler?indirim=true',
    bg: 'from-orange-dark via-orange to-amber-400',
    accent: 'bg-white',
    image: null,
  },
  {
    id: 3,
    badge: 'Özel Koleksiyon',
    title: 'Premium\nKalite',
    subtitle: 'Seçkin kumaşlar ve özenli işçilik ile hazırlanan premium koleksiyonumuz.',
    cta: 'Şimdi Alışveriş Yap',
    href: '/urunler',
    bg: 'from-slate-800 via-slate-700 to-slate-600',
    accent: 'bg-orange',
    image: null,
  },
]

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

  return (
    <div
      className="relative overflow-hidden h-[420px] sm:h-[480px] lg:h-[540px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 bg-gradient-to-br ${s.bg} transition-opacity duration-700
                      ${i === current ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}

      {/* Decorative circles */}
      <div className="absolute right-0 top-0 w-[500px] h-[500px] rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-white/5 translate-y-1/3 translate-x-1/4 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1280px] mx-auto px-5 flex flex-col justify-center">
        <div
          key={current}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white/90 ${slide.accent} mb-4`}>
            {slide.badge}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight whitespace-pre-line">
            {slide.title}
          </h1>
          <p className="mt-4 text-base sm:text-lg text-white/70 max-w-[480px] leading-relaxed">
            {slide.subtitle}
          </p>
          <Link
            href={slide.href}
            className="mt-8 inline-flex items-center gap-2 bg-white text-navy-dark font-bold
                       px-7 py-3.5 rounded-xl hover:bg-orange hover:text-white transition-colors shadow-lg"
          >
            {slide.cta}
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        aria-label="Önceki slayt"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                   bg-white/15 hover:bg-white/30 flex items-center justify-center text-white
                   transition-colors backdrop-blur-sm"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki slayt"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full
                   bg-white/15 hover:bg-white/30 flex items-center justify-center text-white
                   transition-colors backdrop-blur-sm"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slayt ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300
                        ${i === current ? 'w-8 bg-white' : 'w-1.5 bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  )
}
