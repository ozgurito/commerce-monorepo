'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ZoomIn, X, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'
import type { ProductImageDto } from '@/domains/products/products.types'

interface Props {
  images: ProductImageDto[]
  productName: string
  fallbackUrl?: string
}

export function ProductGallery({ images, productName, fallbackUrl }: Props) {
  const sorted = [...images].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return a.displayOrder - b.displayOrder
  })

  const allImages = sorted.length > 0
    ? sorted
    : fallbackUrl
      ? [{ id: 0, productId: 0, imageUrl: fallbackUrl, altText: null, displayOrder: 0, isPrimary: true }]
      : []

  const [activeIdx, setActiveIdx] = useState(0)
  const [fading, setFading] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [hovered, setHovered] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const switchImage = (i: number) => {
    if (i === activeIdx) return
    setFading(true)
    setTimeout(() => {
      setActiveIdx(i)
      setFading(false)
    }, 160)
  }

  const active = allImages[activeIdx]

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // Lightbox klavye
  useEffect(() => {
    if (lightboxIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null)
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i))
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i !== null && i < allImages.length - 1 ? i + 1 : i))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIdx, allImages.length])

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
      {/* Ana görsel — cursor-magnifier zoom */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 cursor-zoom-in select-none"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxIdx(activeIdx)}
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
        {/* Zoom ipucu — sadece hover değilken göster */}
        {!hovered && (
          <div className="absolute top-3 right-3 bg-white/80 rounded-lg p-2 backdrop-blur-sm
                          opacity-0 group-hover:opacity-100 pointer-events-none">
            <ZoomIn size={16} className="text-gray-600" />
          </div>
        )}
      </div>

      {/* Thumbnail'lar */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => switchImage(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                          ${i === activeIdx ? 'border-orange' : 'border-gray-200 hover:border-gray-300'}`}
            >
              <Image
                src={img.imageUrl}
                alt={img.altText ?? `${productName} ${i + 1}`}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && allImages[lightboxIdx] && (
        <div
          className="fixed inset-0 z-[500] bg-black/92 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10
                       rounded-full p-2 transition-colors z-10"
          >
            <X size={20} />
          </button>
          {lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null ? i - 1 : i) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white
                         bg-white/10 rounded-full p-2 transition-colors z-10"
            >
              <ChevronLeft size={24} />
            </button>
          )}
          <div
            className="relative w-full max-w-2xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={allImages[lightboxIdx].imageUrl}
              alt={allImages[lightboxIdx].altText ?? productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {lightboxIdx < allImages.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(i => i !== null ? i + 1 : i) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white
                         bg-white/10 rounded-full p-2 transition-colors z-10"
            >
              <ChevronRight size={24} />
            </button>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
            {lightboxIdx + 1} / {allImages.length}
          </p>
        </div>
      )}
    </div>
  )
}
