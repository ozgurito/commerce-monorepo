'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { TransformWrapper, TransformComponent, type ReactZoomPanPinchRef } from 'react-zoom-pan-pinch'
import { ZoomIn, X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import type { ProductImageDto } from '@/domains/products/products.types'

interface Props {
  images: ProductImageDto[]
  productName: string
  fallbackUrl?: string
  forcedIndex?: number
  selectedColor?: string | null          // seçili renk (ProductDetailPanel'den)
  onImageChange?: (index: number, variantColor: string | null) => void
  onColorSwatch?: (color: string, firstIndex: number) => void  // renk swatchına tıklama
}

export function ProductGallery({
  images,
  productName,
  fallbackUrl,
  forcedIndex,
  selectedColor,
  onImageChange,
  onColorSwatch,
}: Props) {

  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.displayOrder - b.displayOrder
  })

  const allImages = sorted.length > 0
    ? sorted
    : fallbackUrl
      ? [{ id: 0, productId: 0, imageUrl: fallbackUrl, altText: null, displayOrder: 0,
            isPrimary: true, variantId: null, variantColor: null, variantColorHex: null }]
      : []

  // Görseller variantColor taşıyor mu?
  const hasColorData = allImages.some(img => img.variantColor)

  // Renk → görsel listesi
  const colorGroups = (() => {
    const map: Record<string, ProductImageDto[]> = {}
    for (const img of allImages) {
      const key = img.variantColor ?? '__nocolor__'
      if (!map[key]) map[key] = []
      map[key].push(img)
    }
    return map
  })()

  // Renk swatchları için renk listesi (nocolor hariç)
  const colorList = Object.keys(colorGroups).filter(c => c !== '__nocolor__')

  // Galeri thumbnailları: seçili renk varsa sadece o renk, yoksa tüm görseller
  const galleryImages = hasColorData && selectedColor && colorGroups[selectedColor]
    ? colorGroups[selectedColor]
    : allImages

  const [activeIdx, setActiveIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [hovered, setHovered] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  // Parmakla kaydırma (swipe) — mobilde ana görsel ve lightbox üzerinde
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)
  const SWIPE_THRESHOLD = 40

  // Lightbox zoom seviyesi — react-zoom-pan-pinch'in onTransform callback'inden gelir.
  // Sadece 1x'teyken tek-parmak swipe-ile-fotoğraf-değiştirme aktif olsun diye takip ediyoruz.
  const [zoomScale, setZoomScale] = useState(1)

  // Thumbnail scroll
  const thumbRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = () => {
    const el = thumbRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = thumbRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [galleryImages])

  const scrollThumbs = (dir: 'left' | 'right') => {
    thumbRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    // Birden fazla parmak varsa (pinch başlıyor olabilir) swipe takibini hiç başlatma
    if (e.touches.length > 1) { touchStartX.current = null; return }
    touchStartX.current = e.touches[0].clientX
    touchDeltaX.current = 0
  }
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    // Hareket sırasında ikinci parmak eklendiyse (pinch'e dönüştüyse) swipe'ı iptal et
    if (e.touches.length > 1) { touchStartX.current = null; return }
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current
  }
  const handleTouchEndMainImage = () => {
    if (touchStartX.current === null) return
    const delta = touchDeltaX.current
    if (delta > SWIPE_THRESHOLD) switchImage(Math.max(0, activeIdx - 1))
    else if (delta < -SWIPE_THRESHOLD) switchImage(Math.min(galleryImages.length - 1, activeIdx + 1))
    touchStartX.current = null
    touchDeltaX.current = 0
  }
  const handleTouchEndLightbox = () => {
    // Zoomluyken (react-zoom-pan-pinch pan/pinch yönetirken) swipe-ile-fotoğraf-değiştirme devre dışı
    if (touchStartX.current === null || lightboxIdx === null || zoomScale > 1.02) {
      touchStartX.current = null
      touchDeltaX.current = 0
      return
    }
    const delta = touchDeltaX.current
    if (delta > SWIPE_THRESHOLD && lightboxIdx > 0) {
      setLightboxIdx(lightboxIdx - 1)
    } else if (delta < -SWIPE_THRESHOLD && lightboxIdx < galleryImages.length - 1) {
      setLightboxIdx(lightboxIdx + 1)
    }
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  // react-zoom-pan-pinch kontrolü — fotoğraf değişince zoom/pan'ı sıfırlamak için
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null)
  useEffect(() => {
    transformRef.current?.resetTransform(0)
    setZoomScale(1)
  }, [lightboxIdx])

  const active = galleryImages[activeIdx] ?? allImages[0]

  const switchImage = (i: number, external = false) => {
    const img = galleryImages[i]
    if (!img || (i === activeIdx && !external)) return
    setFading(true)
    setTimeout(() => {
      setActiveIdx(i)
      setFading(false)
      if (!external) onImageChange?.(i, img.variantColor ?? null)
    }, 160)
  }

  // Dışarıdan renk/index değişince gallery'yi güncelle
  useEffect(() => {
    if (forcedIndex !== undefined) {
      // forcedIndex allImages içindeki index, galleryImages içinde bul
      const imgAtForced = allImages[forcedIndex]
      if (!imgAtForced) return
      const idx = galleryImages.findIndex(img => img.id === imgAtForced.id)
      if (idx >= 0) {
        switchImage(idx, true)
      } else {
        // Seçili renge ait ilk görsel
        setActiveIdx(0)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forcedIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  // Renk değişince gallery'yi 0'a resetle
  useEffect(() => {
    setActiveIdx(0)
  }, [selectedColor])

  // Lightbox klavye
  useEffect(() => {
    if (lightboxIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight')
        setLightboxIdx(i => (i !== null && i < allImages.length - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, allImages.length])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-50 border border-gray-100
                      flex flex-col items-center justify-center gap-3 text-gray-300">
        <ImageOff size={56} strokeWidth={1.2} />
        <span className="text-sm text-gray-400 font-medium">{productName}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* ── Ana Görsel — mobilde kenarsız (tam genişlik), masaüstünde köşeli/paddingli kart ── */}
      <div
        className="relative aspect-square overflow-hidden bg-white cursor-zoom-in select-none
                   -mx-5 rounded-none sm:mx-0 sm:rounded-2xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEndMainImage}
        onClick={() => setLightboxIdx(galleryImages.findIndex(img => img.id === active.id))}
      >
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            transform: hovered ? 'scale(2.2)' : 'scale(1)',
            opacity: fading ? 0 : 1,
            transition: fading
              ? 'opacity 0.16s ease'
              : 'opacity 0.16s ease, transform 0.08s ease-out',
            willChange: 'transform, opacity',
          }}
        >
          <Image
            src={active.imageUrl}
            alt={active.altText ?? productName}
            fill
            priority
            sizes="(max-width:768px) 100vw, 50vw"
            className="object-contain"
            draggable={false}
          />
        </div>
        {!hovered && (
          <div className="absolute top-3 right-3 bg-white/80 rounded-lg p-2 backdrop-blur-sm
                          opacity-0 group-hover:opacity-100 pointer-events-none">
            <ZoomIn size={16} className="text-gray-600" />
          </div>
        )}

        {/* Mobilde nokta göstergesi — thumbnail satırı gizli olduğu için kaç görsel olduğunu
            ve parmakla kaydırılabildiğini gösterir */}
        {galleryImages.length > 1 && (
          <div className="sm:hidden absolute bottom-2.5 left-1/2 -translate-x-1/2
                          flex items-center gap-1.5 pointer-events-none">
            {galleryImages.map((img, i) => (
              <span
                key={img.id}
                className={`rounded-full transition-all ${
                  i === activeIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                }`}
                style={{ boxShadow: '0 0 3px rgba(0,0,0,.4)' }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Galeri Thumbnailları + Scroll Okları — mobilde gizli (renk seçimi + lightbox yeterli),
          masaüstünde görünür ── */}
      {galleryImages.length > 1 && (
        <div className="relative hidden sm:block">
          {/* Sol ok */}
          {canScrollLeft && (
            <button
              onClick={() => scrollThumbs('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10
                         w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center
                         text-gray-500 hover:text-orange transition-colors -translate-x-1"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          {/* Thumbnail şeridi */}
          <div
            ref={thumbRef}
            className="flex gap-2 overflow-x-auto scrollbar-none pb-1 px-1"
          >
            {galleryImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => switchImage(i)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden
                             border-2 transition-all
                             ${i === activeIdx
                               ? 'border-orange shadow-sm'
                               : 'border-gray-200 hover:border-gray-300'}`}
              >
                <Image
                  src={img.imageUrl}
                  alt={img.altText ?? img.variantColor ?? `${productName} ${i + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Sağ ok */}
          {canScrollRight && (
            <button
              onClick={() => scrollThumbs('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10
                         w-6 h-6 bg-white shadow-md rounded-full flex items-center justify-center
                         text-gray-500 hover:text-orange transition-colors translate-x-1"
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ── Lightbox — yalnızca seçili rengin görselleri ── */}
      {lightboxIdx !== null && galleryImages[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[500] bg-black/92 flex items-center justify-center p-4"
          onClick={() => { if (zoomScale <= 1.02) setLightboxIdx(null) }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEndLightbox}
        >
          <button onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white
                       bg-white/10 rounded-full p-2 transition-colors z-10">
            <X size={20} />
          </button>
          {lightboxIdx > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? i - 1 : i) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white
                         bg-white/10 rounded-full p-2 transition-colors z-10">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="relative w-full h-full sm:w-[min(80vw,640px)] sm:h-[85vh] overflow-hidden"
               style={{ touchAction: 'none' }}
               onClick={e => e.stopPropagation()}>
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={1}
              maxScale={4}
              centerOnInit
              centerZoomedOut
              panning={{ disabled: zoomScale <= 1.02 }}
              pinch={{ step: 5 }}
              doubleClick={{ mode: 'toggle', step: 2 }}
              wheel={{ disabled: true }}
              onTransform={(_ref, state) => setZoomScale(state.scale)}
            >
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={galleryImages[lightboxIdx].imageUrl}
                    alt={galleryImages[lightboxIdx].altText ?? productName}
                    fill className="object-contain" sizes="100vw"
                    draggable={false}
                  />
                </div>
              </TransformComponent>
            </TransformWrapper>
          </div>
          {zoomScale > 1.02 && (
            <p className="absolute bottom-14 left-1/2 -translate-x-1/2 text-white/60 text-xs
                          bg-white/10 px-3 py-1 rounded-full pointer-events-none">
              Yakınlaştırıldı — küçültmek için parmaklarını yaklaştır veya çift dokun
            </p>
          )}
          {lightboxIdx < galleryImages.length - 1 && (
            <button
              onClick={e => { e.stopPropagation(); setLightboxIdx(i => i !== null ? i + 1 : i) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white
                         bg-white/10 rounded-full p-2 transition-colors z-10">
              <ChevronRight size={24} />
            </button>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIdx + 1} / {galleryImages.length}
          </p>
        </div>
      )}
    </div>
  )
}
