'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Truck, Tag, Zap, Shield } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    badge: 'Yeni Sezon • Feccy',
    badgeCls: 'bg-orange text-white',
    title: 'Grafik Baskılı\nOversize Tişört',
    subtitle: 'Doğa temalı özel baskılar, kaliteli kumaş. Her gün rahat, her yerde şık.',
    cta: 'Tişörtleri İncele',
    href: '/kategori/tshirt',
    image: '/images/slider/hero-three-warm.png',
    imageAlt: 'Feccy beyaz, kırmızı ve lacivert tişört koleksiyonu',
    imagePos: 'object-center',
    overlay: 'from-black/65 via-black/30 to-transparent',
  },
  {
    id: 2,
    badge: 'Yeni Gelenler',
    badgeCls: 'bg-white text-[#0d1a40]',
    title: 'Yeni Renkler\nGeldi',
    subtitle: 'Mavi, pembe ve siyah seçeneklerle günlük stilini tamamla.',
    cta: 'Yeni Ürünleri Gör',
    href: '/urunler?yeni=true',
    image: '/images/slider/hero-three-cool.png',
    imageAlt: 'Feccy mavi, pembe ve siyah tişört koleksiyonu',
    imagePos: 'object-center',
    overlay: 'from-[#0a0f1e]/65 via-[#0a0f1e]/30 to-transparent',
  },
  {
    id: 3,
    badge: '%50\'ye Varan İndirim',
    badgeCls: 'bg-white text-red-600',
    title: 'İndirimler\nBaşladı',
    subtitle: 'Seçili ürünlerde büyük indirimler. Stoklar sınırlı, fırsatı kaçırma.',
    cta: 'İndirimleri Gör',
    href: '/urunler?indirim=true',
    image: '/images/slider/main-slider-4.webp',
    imageAlt: 'Sezon sonu kampanya görseli',
    imagePos: 'object-center',
    overlay: 'from-black/80 via-black/55 to-black/10',
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
      className="relative overflow-hidden"
      style={{ height: 'clamp(260px, 55vw, 620px)' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Full-bleed background images */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image
            src={s.image}
            alt={s.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
            className={`object-cover ${s.imagePos}`}
            priority={i === 0}
          />
          {/* Left→Right gradient overlay — metin okunabilirliği */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          {/* Alt vignette */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Üst vignette */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1280px] mx-auto px-6 sm:px-10 flex items-center">
        <div
          key={current}
          className="max-w-[580px] animate-in fade-in slide-in-from-bottom-6 duration-600"
        >
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full
                           text-xs font-extrabold tracking-wide mb-5 ${slide.badgeCls}`}>
            <Zap size={11} />
            {slide.badge}
          </span>

          <h1 className="text-[clamp(2.2rem,5.5vw,4.2rem)] font-extrabold text-white leading-[1.05]
                         whitespace-pre-line drop-shadow-lg">
            {slide.title}
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/70 max-w-[440px] leading-relaxed drop-shadow">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 bg-orange text-white font-extrabold
                         px-7 py-3.5 rounded-xl hover:bg-orange/90 transition-all
                         duration-200 shadow-xl shadow-orange/30 hover:-translate-y-0.5 text-sm"
            >
              {slide.cta}
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/urunler"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white
                         font-semibold px-5 py-3.5 rounded-xl border border-white/25
                         hover:bg-white/25 transition-all duration-200 text-sm"
            >
              Tüm ürünleri gör
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-5 mt-8 flex-wrap">
            {[
              { icon: Truck,  text: '1000₺ üzeri ücretsiz kargo' },
              { icon: Shield, text: 'Güvenli ödeme' },
              { icon: Tag,    text: '14 gün iade' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-white/55 text-[11px] font-medium">
                <Icon size={12} className="text-orange/80" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      <button
        onClick={prev}
        aria-label="Önceki slayt"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20
                   flex items-center justify-center text-white transition-all
                   backdrop-blur-sm hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki slayt"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20
                   flex items-center justify-center text-white transition-all
                   backdrop-blur-sm hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slayt ${i + 1}`}
            className={`rounded-full transition-all duration-300
                        ${i === current
                          ? 'w-8 h-2 bg-orange'
                          : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </div>
  )
}
