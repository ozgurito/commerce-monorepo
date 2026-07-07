'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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
    desktopImage: '/images/slider/slide-1-desktop.webp',
    mobileImage: '/images/slider/slide-1-mobile.webp',
    imageAlt: 'Feccy beyaz, kırmızı ve lacivert tişört koleksiyonu',
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
    desktopImage: '/images/slider/slide-2-desktop.webp',
    mobileImage: '/images/slider/slide-2-mobile.webp',
    imageAlt: 'Feccy mavi, pembe ve siyah tişört koleksiyonu',
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
    desktopImage: '/images/slider/slide-3-desktop.webp',
    mobileImage: '/images/slider/slide-3-mobile.webp',
    imageAlt: 'Sezon sonu kampanya görseli',
    overlay: 'from-black/80 via-black/55 to-black/10',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), [])

  // current'i dependency'e ekleyerek her slayt değişiminde (otomatik veya manuel:
  // ok, nokta, swipe) 5 saniyelik sayaç sıfırlanıp yeniden başlar.
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [isPaused, next, current])

  // Parmakla kaydırma (swipe) — mobilde ok butonları gizli olduğu için asıl gezinme yolu
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)
  const SWIPE_THRESHOLD = 40

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }
  const handleTouchEnd = () => {
    if (touchStartX.current === null) return
    const delta = touchDeltaX.current
    if (delta > SWIPE_THRESHOLD) prev()
    else if (delta < -SWIPE_THRESHOLD) next()
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  const slide = SLIDES[current]

  return (
    <div
      className="relative overflow-hidden h-[430px] sm:h-[500px] md:h-[560px] lg:h-[620px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-bleed background images */}
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0">
            {/* Desktop — bulanık cover arka plan (object-contain'in bıraktığı boşluğu doldurur) */}
            <Image
              src={s.desktopImage}
              alt=""
              fill
              sizes="100vw"
              className="hidden md:block object-cover blur-xl scale-110 opacity-60"
              aria-hidden="true"
            />
            {/* Desktop — asıl görsel, kırpılmadan (object-contain) */}
            <Image
              src={s.desktopImage}
              alt={s.imageAlt}
              fill
              sizes="100vw"
              className="hidden md:block object-contain"
              priority={i === 0}
            />
            {/* Mobil — dikey (9:16) görsel, tam kaplar */}
            <Image
              src={s.mobileImage}
              alt={s.imageAlt}
              fill
              sizes="100vw"
              className="block md:hidden object-cover object-center"
              priority={i === 0}
            />
          </div>
          {/* Left→Right gradient overlay — mobilde sabit güçlü kontrast, masaüstünde slayta özel */}
          <div className="md:hidden absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className={`hidden md:block absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          {/* Alt vignette */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
          {/* Üst vignette */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full max-w-[1280px] mx-auto px-5 sm:px-8 md:px-10 flex items-center">
        <div
          key={current}
          className="max-w-[320px] sm:max-w-[440px] md:max-w-[580px] animate-in fade-in slide-in-from-bottom-6 duration-600"
        >
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full
                           text-xs font-extrabold tracking-wide mb-5 ${slide.badgeCls}`}>
            <Zap size={11} />
            {slide.badge}
          </span>

          <h1 className="text-[32px] sm:text-[40px] md:text-[clamp(2.2rem,5.5vw,4.2rem)] font-extrabold
                         text-white leading-[1.05] whitespace-pre-line drop-shadow-lg">
            {slide.title}
          </h1>

          <p className="mt-4 text-xs sm:text-sm md:text-base text-white/70 max-w-[300px] sm:max-w-[440px]
                        leading-relaxed drop-shadow line-clamp-2 sm:line-clamp-none">
            {slide.subtitle}
          </p>

          <div className="mt-8 flex items-center gap-3 flex-wrap">
            <Link
              href={slide.href}
              className="inline-flex items-center gap-2 bg-orange text-white font-extrabold
                         px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl hover:bg-orange/90 transition-all
                         duration-200 shadow-xl shadow-orange/30 hover:-translate-y-0.5 text-xs sm:text-sm"
            >
              {slide.cta}
              <ChevronRight size={16} />
            </Link>
            <Link
              href="/urunler"
              className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white
                         font-semibold px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl border border-white/25
                         hover:bg-white/25 transition-all duration-200 text-xs sm:text-sm"
            >
              Tüm ürünleri gör
            </Link>
          </div>

          {/* Trust badges — mobilde gizli, yer sıkışmasın diye */}
          <div className="hidden sm:flex items-center gap-5 mt-8 flex-wrap">
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

      {/* Arrow controls — mobilde gizli, yer kaplamasın diye */}
      <button
        onClick={prev}
        aria-label="Önceki slayt"
        className="hidden sm:flex absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20
                   items-center justify-center text-white transition-all
                   backdrop-blur-sm hover:scale-110"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        aria-label="Sonraki slayt"
        className="hidden sm:flex absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20
                   w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 border border-white/20
                   items-center justify-center text-white transition-all
                   backdrop-blur-sm hover:scale-110"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
