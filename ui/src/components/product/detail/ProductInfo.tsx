'use client'
import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield, Share2, Check, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import { VariantSelector } from './VariantSelector'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { ProductDetailDto, ProductVariantDto } from '@/domains/products/products.types'

const FREE_SHIPPING_THRESHOLD = 150

interface Props {
  product: ProductDetailDto
}

export function ProductInfo({ product }: Props) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | null>(null)
  const [variantError, setVariantError] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)
  const variantRef = useRef<HTMLDivElement>(null)

  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer } = useCartStore()
  const queryClient = useQueryClient()
  const { push: pushRecent } = useRecentlyViewed()

  // Track recently viewed once on mount — pushRecent writes to localStorage only, no setState
  const trackedRef = useRef<null | true>(null)
  if (trackedRef.current == null) {
    trackedRef.current = true
    pushRecent({
      id:       product.id,
      slug:     product.slug,
      name:     product.name,
      price:    product.price,
      imageUrl: product.images?.[0]?.imageUrl ?? null,
    })
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const savings = hasDiscount ? product.comparePrice! - product.price : 0

  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock
  const isOutOfStock = effectiveStock === 0
  const maxQty = Math.min(effectiveStock, 10)
  const displayPrice = product.price + (selectedVariant?.priceModifier ?? 0)
  const needsForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - displayPrice * quantity)
  const hasFreeShipping = displayPrice * quantity >= FREE_SHIPPING_THRESHOLD

  const cartMutation = useMutation({
    mutationFn: () => cartApi.addItem({ productId: product.id, variantId: selectedVariant?.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      openDrawer()
      toast.success('Ürün sepete eklendi')
    },
    onError: () => toast.error('Sepete eklenemedi'),
  })

  const wishlistMutation = useMutation({
    mutationFn: () => wishlisted ? wishlistApi.remove(product.id) : wishlistApi.add(product.id),
    onSuccess: () => {
      setWishlisted(w => !w)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.all })
      toast.success(wishlisted ? 'Favorilerden kaldırıldı' : 'Favorilere eklendi')
    },
  })

  const handleAddToCart = () => {
    if (!token) { openAuthModal('login'); return }
    if (product.variants.length > 0 && !selectedVariant) {
      setVariantError(true)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error('Lütfen önce bir varyant seçin')
      return
    }
    cartMutation.mutate()
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Link kopyalandı!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Link kopyalanamadı')
    }
  }

  return (
    <div className="space-y-5 lg:sticky lg:top-[130px]">

      {/* Category + title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-orange uppercase tracking-widest">
            {product.categoryName}
          </p>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600
                       transition-colors"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Share2 size={13} />}
            {copied ? 'Kopyalandı' : 'Paylaş'}
          </button>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-navy-dark leading-snug">
          {product.name}
        </h1>
      </div>

      {/* Rating */}
      {product.totalReviews > 0 && (
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14}
                className={s <= Math.round(product.averageRating)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'} />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-700">{product.averageRating.toFixed(1)}</span>
          <a href="#reviews"
            className="text-xs text-gray-400 hover:text-orange transition-colors">
            {product.totalReviews} değerlendirme
          </a>
        </div>
      )}

      {/* Sosyal kanıt */}
      {product.totalReviews > 0 && !isOutOfStock && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 border border-amber-100
                        rounded-xl px-3 py-2">
          <ShoppingCart size={14} className="text-amber-500 flex-shrink-0" />
          <span>
            <strong className="text-gray-800">{Math.max(10, product.totalReviews * 3).toLocaleString('tr-TR')} kişinin</strong>{' '}
            sepetinde, tükenmeden al!
          </span>
        </div>
      )}

      {/* Price section */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
        <div className="flex items-end gap-3">
          <span className="text-[2rem] font-extrabold text-orange leading-none">
            {formatPrice(displayPrice)}
          </span>
          {hasDiscount && (
            <div className="flex items-center gap-2 pb-1">
              <span className="text-base text-gray-400 line-through">
                {formatPrice(product.comparePrice!)}
              </span>
              <span className="bg-red-500 text-white text-xs font-extrabold
                               px-2 py-0.5 rounded-full">
                %{discountPct} İNDİRİM
              </span>
            </div>
          )}
        </div>
        {hasDiscount && savings > 0 && (
          <p className="text-sm text-green-600 font-semibold">
            🎉 {formatPrice(savings)} tasarruf ediyorsunuz!
          </p>
        )}
      </div>

      {/* Stock badge */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-500
                           bg-red-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Stokta yok
          </span>
        ) : effectiveStock <= 5 ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange
                           bg-orange-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            Son {effectiveStock} ürün!
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600
                           bg-green-50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Stokta mevcut
          </span>
        )}
      </div>

      {/* Variant selector */}
      <div ref={variantRef}>
        <VariantSelector
          variants={product.variants}
          selected={selectedVariant}
          onSelect={(v) => { setSelectedVariant(v); setVariantError(false) }}
          hasError={variantError}
        />
      </div>

      {/* Quantity */}
      {!isOutOfStock && (
        <div className="flex items-center gap-4">
          <p className="text-sm font-bold text-gray-700">Adet</p>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 flex items-center justify-center text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 transition-colors border-r border-gray-100"
            >
              <Minus size={14} />
            </button>
            <span className="w-12 text-center text-sm font-extrabold text-navy-dark">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
              disabled={quantity >= maxQty}
              className="w-10 h-10 flex items-center justify-center text-gray-600
                         hover:bg-gray-50 disabled:opacity-40 transition-colors border-l border-gray-100"
            >
              <Plus size={14} />
            </button>
          </div>
          <span className="text-xs text-gray-400">Max {maxQty} adet</span>
        </div>
      )}

      {/* Kampanya kutusu */}
      {(hasDiscount || displayPrice >= FREE_SHIPPING_THRESHOLD || product.stock > 100) && (
        <div className="border border-orange/20 rounded-xl p-3 bg-orange/[0.03] space-y-1.5">
          <p className="text-[11px] font-extrabold text-orange uppercase tracking-wide">Ürün Kampanyaları</p>
          {displayPrice >= FREE_SHIPPING_THRESHOLD && (
            <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold">
              <Truck size={13} className="text-emerald-500 flex-shrink-0" />
              Sepette Kargo Bedava uygulanır
            </div>
          )}
          {hasDiscount && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">-%{discountPct}</span>
              <span>İndirimli fiyatla <strong className="text-orange">{formatPrice(displayPrice)}</strong></span>
            </div>
          )}
          {product.stock > 100 && (
            <p className="text-[11px] text-gray-400">100 adetten fazla stok sunulmuştur.</p>
          )}
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || cartMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 bg-orange hover:bg-orange-dark
                     active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange/20
                     text-[15px]"
        >
          <ShoppingBag size={18} />
          {isOutOfStock ? 'Stokta Yok' : cartMutation.isPending ? 'Ekleniyor…' : 'Sepete Ekle'}
        </button>
        <button
          onClick={() => { if (!token) { openAuthModal('login'); return }; wishlistMutation.mutate() }}
          aria-label="Favorilere ekle"
          className={`w-14 rounded-2xl border-2 flex items-center justify-center transition-all
                      active:scale-95
                      ${wishlisted
                        ? 'border-red-300 bg-red-50 text-red-500 shadow-sm'
                        : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'}`}
        >
          <Heart size={19} className={wishlisted ? 'fill-red-500' : ''} />
        </button>
      </div>

      {/* Free shipping progress */}
      {!isOutOfStock && (
        <div className="rounded-2xl border border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white">
          {hasFreeShipping ? (
            <div className="flex items-center gap-2 text-green-600">
              <Truck size={16} className="fill-green-100 flex-shrink-0" />
              <span className="text-sm font-bold">Bu siparişe ücretsiz kargo kazandınız! 🎉</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Truck size={15} className="text-orange flex-shrink-0" />
                <span className="text-sm">
                  <strong className="text-orange">{formatPrice(needsForFreeShipping)}</strong>
                  {' '}daha ekle, ücretsiz kargo kazan!
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange to-orange-dark rounded-full
                               transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (displayPrice * quantity / FREE_SHIPPING_THRESHOLD) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield,    label: 'Güvenli Ödeme', sub: '256-bit SSL' },
          { icon: RotateCcw, label: '30 Gün İade',    sub: 'Ücretsiz' },
          { icon: Truck,     label: 'Hızlı Kargo',    sub: '1-3 iş günü' },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label}
            className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
            <Icon size={18} className="text-orange" />
            <span className="text-[11px] font-bold text-navy-dark leading-tight">{label}</span>
            <span className="text-[10px] text-gray-400">{sub}</span>
          </div>
        ))}
      </div>

      {/* Description */}
      {product.description && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-extrabold text-gray-800 mb-2">Ürün Açıklaması</h3>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Product specs */}
      {(product.material || product.fitType || product.season || product.originCountry) && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-extrabold text-gray-800 mb-3">Ürün Özellikleri</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'Materyal',  val: product.material },
              { key: 'Kesim',     val: product.fitType },
              { key: 'Sezon',     val: product.season },
              { key: 'Menşei',    val: product.originCountry },
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
  )
}
