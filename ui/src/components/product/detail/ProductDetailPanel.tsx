'use client'
import { useState, useMemo } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { ChevronDown } from 'lucide-react'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import { isHtmlContent } from '@/lib/html'
import { parseSpecifications } from '@/domains/products/categoryFields'
import type { ProductDetailDto } from '@/domains/products/products.types'

interface Props {
  product: ProductDetailDto
}

export function ProductDetailPanel({ product }: Props) {
  const [forcedGalleryIndex, setForcedGalleryIndex] = useState<number | undefined>(undefined)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [imageClickColor, setImageClickColor] = useState<string | null>(null)
  const [descOpen, setDescOpen] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const imagesHaveVariants = useMemo(() =>
    (product.images ?? []).some(img => img.variantColor),
  [product.images])

  // Görsel thumbnail tıklanınca → renk seç
  const handleImageChange = (_idx: number, variantColor: string | null) => {
    if (variantColor) {
      setImageClickColor(variantColor)
      setActiveColor(variantColor)
    }
  }

  // Renk swatchına tıklanınca → gallery'yi yönlendir + rengi güncelle
  const handleColorSwatch = (color: string, firstIndex: number) => {
    setActiveColor(color)
    setImageClickColor(color)
    setForcedGalleryIndex(firstIndex)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 lg:gap-10 lg:items-start">

      {/* Galeri — mobilde 1. sırada, masaüstünde sol üst */}
      <div className="order-1 lg:order-none lg:col-start-1 lg:row-start-1">
        <ProductGallery
          images={product.images ?? []}
          productName={product.name}
          fallbackUrl={product.imageUrl ?? product.images?.[0]?.imageUrl}
          forcedIndex={forcedGalleryIndex}
          selectedColor={activeColor}
          onImageChange={handleImageChange}
          onColorSwatch={handleColorSwatch}
        />
      </div>

      {/* Bilgi + Varyant + Sepet — mobilde 2. sırada (galerinin hemen altında), masaüstünde sağ sütun */}
      <div className="order-2 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2">
        <ProductInfo
          product={product}
          onGalleryChange={setForcedGalleryIndex}
          onColorSelect={(color) => setActiveColor(color)}
          imageClickColor={imageClickColor}
          imagesHaveVariants={imagesHaveVariants}
        />
      </div>

      {/* Açıklama + Detaylar — mobilde 3. sırada (en altta), masaüstünde sol altta */}
      <div className="order-3 lg:order-none lg:col-start-1 lg:row-start-2 space-y-6">
        {/* Ürün Açıklaması */}
        {product.description && (
          <div className="border-t border-gray-100 pt-5">
            <button
              onClick={() => setDescOpen(o => !o)}
              className="w-full flex items-center justify-between gap-2"
              aria-expanded={descOpen}
            >
              <h3 className="text-base font-extrabold text-gray-800">Ürün Açıklaması</h3>
              <ChevronDown size={18}
                className={`text-gray-400 flex-shrink-0 transition-transform ${descOpen ? 'rotate-180' : ''}`} />
            </button>
            {descOpen && (
              isHtmlContent(product.description) ? (
                <div
                  className="text-sm text-gray-600 leading-relaxed mt-3
                             [&_p]:mb-2 [&_p:last-child]:mb-0
                             [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2
                             [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2
                             [&_strong]:font-bold [&_em]:italic"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              ) : product.description.includes(';') ? (
                <ul className="space-y-2 mt-3">
                  {product.description
                    .split(/[;]+/)
                    .map((s: string) => s.replace(/^[\s.]+|[\s.]+$/g, ''))
                    .filter((s: string) => s.length > 4)
                    .slice(0, 10)
                    .map((sentence: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange flex-shrink-0 mt-1.5" />
                        {sentence}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line mt-3">
                  {product.description}
                </p>
              )
            )}
          </div>
        )}

        {/* Ürün Detayları */}
        {(() => {
          const specs = parseSpecifications(product.specifications)
          const detailRows = [
            { key: 'Materyal',       val: product.material },
            { key: 'Gramaj/İçerik', val: product.fabricComposition },
            { key: 'Yıkama',        val: product.careInstructions },
            { key: 'Kesim',         val: product.fitType },
            { key: 'Cinsiyet',      val: product.gender },
            { key: 'Sezon',         val: product.season },
            { key: 'Menşei',        val: product.originCountry },
            ...Object.entries(specs).map(([key, val]) => ({ key, val })),
          ].filter(x => x.val)

          if (!detailRows.length) return null

          return (
            <div className="border-t border-gray-100 pt-5">
              <button
                onClick={() => setDetailsOpen(o => !o)}
                className="w-full flex items-center justify-between gap-2"
                aria-expanded={detailsOpen}
              >
                <h3 className="text-base font-extrabold text-gray-800">Ürün Detayları</h3>
                <ChevronDown size={18}
                  className={`text-gray-400 flex-shrink-0 transition-transform ${detailsOpen ? 'rotate-180' : ''}`} />
              </button>
              {detailsOpen && (
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {detailRows.map(({ key, val }) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-2.5">
                      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{key}</p>
                      <p className="text-sm text-gray-800 font-semibold mt-0.5">{val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
