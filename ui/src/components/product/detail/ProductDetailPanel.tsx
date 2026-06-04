'use client'
import { useState, useMemo } from 'react'
import { ProductGallery } from './ProductGallery'
import { ProductInfo } from './ProductInfo'
import type { ProductDetailDto } from '@/domains/products/products.types'

interface Props {
  product: ProductDetailDto
}

export function ProductDetailPanel({ product }: Props) {
  const [forcedGalleryIndex, setForcedGalleryIndex] = useState<number | undefined>(undefined)
  const [activeColor, setActiveColor] = useState<string | null>(null)
  const [imageClickColor, setImageClickColor] = useState<string | null>(null)

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

      {/* Sol: Galeri + Açıklama + Detaylar */}
      <div className="space-y-6">
        <ProductGallery
          images={product.images ?? []}
          productName={product.name}
          fallbackUrl={product.imageUrl ?? product.images?.[0]?.imageUrl}
          forcedIndex={forcedGalleryIndex}
          selectedColor={activeColor}
          onImageChange={handleImageChange}
          onColorSwatch={handleColorSwatch}
        />

        {/* Ürün Açıklaması */}
        {product.description && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-base font-extrabold text-gray-800 mb-3">Ürün Açıklaması</h3>
            {product.description.includes(';') ? (
              <ul className="space-y-2">
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
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            )}
          </div>
        )}

        {/* Ürün Detayları */}
        {(product.material || product.fabricComposition || product.careInstructions ||
          product.fitType  || product.gender            || product.season           ||
          product.originCountry) && (
          <div className="border-t border-gray-100 pt-5">
            <h3 className="text-base font-extrabold text-gray-800 mb-3">Ürün Detayları</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'Materyal',       val: product.material },
                { key: 'Gramaj/İçerik', val: product.fabricComposition },
                { key: 'Yıkama',        val: product.careInstructions },
                { key: 'Kesim',         val: product.fitType },
                { key: 'Cinsiyet',      val: product.gender },
                { key: 'Sezon',         val: product.season },
                { key: 'Menşei',        val: product.originCountry },
              ].filter(x => x.val).map(({ key, val }) => (
                <div key={key} className="bg-gray-50 rounded-xl p-2.5">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{key}</p>
                  <p className="text-sm text-gray-800 font-semibold mt-0.5">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sağ: Bilgi + Varyant + Sepet */}
      <ProductInfo
        product={product}
        onGalleryChange={setForcedGalleryIndex}
        onColorSelect={(color) => setActiveColor(color)}
        imageClickColor={imageClickColor}
        imagesHaveVariants={imagesHaveVariants}
      />
    </div>
  )
}
