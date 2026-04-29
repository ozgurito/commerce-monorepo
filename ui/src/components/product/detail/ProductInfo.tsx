'use client'
import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import { VariantSelector } from './VariantSelector'
import type { ProductDetailDto, ProductVariantDto } from '@/domains/products/products.types'

interface Props {
  product: ProductDetailDto
}

export function ProductInfo({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null)
  const [variantError, setVariantError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const variantRef = useRef<HTMLDivElement>(null)

  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer } = useCartStore()
  const queryClient = useQueryClient()

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0

  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock
  const isOutOfStock = effectiveStock === 0
  const maxQty = Math.min(effectiveStock, 10)

  const displayPrice = product.price + (selectedVariant?.priceModifier ?? 0)

  const cartMutation = useMutation({
    mutationFn: () =>
      cartApi.addItem({
        productId: product.id,
        variantId: selectedVariant?.id,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      openDrawer()
      toast.success('Ürün sepete eklendi')
    },
    onError: () => toast.error('Sepete eklenemedi'),
  })

  const wishlistMutation = useMutation({
    mutationFn: () =>
      wishlisted ? wishlistApi.remove(product.id) : wishlistApi.add(product.id),
    onSuccess: () => {
      setWishlisted((w) => !w)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.all })
      toast.success(wishlisted ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi')
    },
  })

  const handleAddToCart = () => {
    if (!token) { openAuthModal('login'); return }
    if (product.variants.length > 0 && !selectedVariant) {
      setVariantError(true)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    cartMutation.mutate()
  }

  const handleWishlist = () => {
    if (!token) { openAuthModal('login'); return }
    wishlistMutation.mutate()
  }

  return (
    <div className="space-y-5">
      {/* Kategori + başlık */}
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">
          {product.categoryName}
        </p>
        <h1 className="text-2xl font-extrabold text-navy-dark leading-snug">{product.name}</h1>
      </div>

      {/* Rating */}
      {product.totalReviews > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={14}
                className={s <= Math.round(product.averageRating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'}
              />
            ))}
          </div>
          <span className="text-sm font-semibold text-gray-700">
            {product.averageRating.toFixed(1)}
          </span>
          <a href="#reviews" className="text-xs text-gray-400 hover:text-orange transition-colors">
            ({product.totalReviews} değerlendirme)
          </a>
        </div>
      )}

      {/* Fiyat */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-extrabold text-navy-dark">{formatPrice(displayPrice)}</span>
        {hasDiscount && (
          <>
            <span className="text-lg text-gray-400 line-through">{formatPrice(product.comparePrice!)}</span>
            <span className="bg-red-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
              -{discountPct}%
            </span>
          </>
        )}
      </div>

      {/* Stok durumu */}
      <div>
        {isOutOfStock ? (
          <span className="text-sm font-semibold text-red-500">Stokta yok</span>
        ) : effectiveStock <= 5 ? (
          <span className="text-sm font-semibold text-orange">
            Son {effectiveStock} ürün!
          </span>
        ) : (
          <span className="text-sm text-green-600 font-semibold">Stokta var</span>
        )}
      </div>

      {/* Varyant seçimi */}
      <div ref={variantRef}>
        <VariantSelector
          variants={product.variants}
          selected={selectedVariant}
          onSelect={(v) => { setSelectedVariant(v); setVariantError(false) }}
          hasError={variantError}
        />
      </div>

      {/* Miktar */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-gray-700">Adet</p>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-bold">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="w-10 h-10 flex items-center justify-center text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Sepete ekle + favori */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || cartMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                     text-white font-bold py-3.5 rounded-xl transition-colors
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ShoppingBag size={18} />
          {isOutOfStock ? 'Stokta Yok' : cartMutation.isPending ? 'Ekleniyor…' : 'Sepete Ekle'}
        </button>
        <button
          onClick={handleWishlist}
          aria-label="Favorilere ekle"
          className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-colors
                      ${wishlisted
                        ? 'border-red-200 bg-red-50 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}`}
        >
          <Heart size={18} className={wishlisted ? 'fill-red-500' : ''} />
        </button>
      </div>

      {/* Kargo bilgisi */}
      <div className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Truck size={15} className="text-orange flex-shrink-0" />
          <span>150₺ ve üzeri siparişlerde <strong>ücretsiz kargo</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RotateCcw size={15} className="text-orange flex-shrink-0" />
          <span>30 gün içinde ücretsiz iade</span>
        </div>
      </div>

      {/* Açıklama */}
      {product.description && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Ürün Açıklaması</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Ürün detayları */}
      {(product.material || product.fitType || product.season || product.originCountry) && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Ürün Özellikleri</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {product.material && (
              <><dt className="text-gray-400">Materyal</dt><dd className="text-gray-700">{product.material}</dd></>
            )}
            {product.fitType && (
              <><dt className="text-gray-400">Kesim</dt><dd className="text-gray-700">{product.fitType}</dd></>
            )}
            {product.season && (
              <><dt className="text-gray-400">Sezon</dt><dd className="text-gray-700">{product.season}</dd></>
            )}
            {product.originCountry && (
              <><dt className="text-gray-400">Menşei</dt><dd className="text-gray-700">{product.originCountry}</dd></>
            )}
          </dl>
        </div>
      )}
    </div>
  )
}
