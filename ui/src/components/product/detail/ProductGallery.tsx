'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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

      {/* ── Ana Görsel ── */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
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
      </div>

      {/* ── Galeri Thumbnailları + Scroll Okları ── */}
      {galleryImages.length > 1 && (
        <div className="relative">
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
          onClick={() => setLightboxIdx(null)}
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
          <div className="relative w-full max-w-2xl aspect-square"
               onClick={e => e.stopPropagation()}>
            <Image
              src={galleryImages[lightboxIdx].imageUrl}
              alt={galleryImages[lightboxIdx].altText ?? productName}
              fill className="object-contain" sizes="100vw"
            />
          </div>
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
