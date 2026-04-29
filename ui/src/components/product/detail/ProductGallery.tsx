'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ZoomIn } from 'lucide-react'
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
  const [zoomed, setZoomed] = useState(false)
  const active = allImages[activeIdx]

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-gray-100 flex items-center justify-center text-gray-300 text-7xl">
        ?
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Ana görsel */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 group cursor-zoom-in"
        onClick={() => setZoomed(true)}
      >
        <Image
          src={active.imageUrl}
          alt={active.altText ?? productName}
          fill
          priority
          sizes="(max-width:768px) 100vw, 50vw"
          className="object-cover"
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity
                        bg-white/80 rounded-lg p-2 backdrop-blur-sm">
          <ZoomIn size={16} className="text-gray-600" />
        </div>
      </div>

      {/* Thumbnail'lar */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(i)}
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

      {/* Zoom overlay */}
      {zoomed && active && (
        <div
          className="fixed inset-0 z-[500] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <div className="relative w-full max-w-2xl aspect-square">
            <Image
              src={active.imageUrl}
              alt={active.altText ?? productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </div>
  )
}
