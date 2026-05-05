'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield, Share2, Check, ShoppingCart, CheckCircle2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cartApi } from '@/domains/cart/cart.api'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/utils/format'
import { VariantSelector, groupVariants } from './VariantSelector'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { ProductDetailDto, ProductVariantDto } from '@/domains/products/products.types'

// FREE_SHIPPING_THRESHOLD utils/format.ts'den import ediliyor

interface Props {
  product: ProductDetailDto
}

export function ProductInfo({ product }: Props) {
  // Beden ve renk grupları ayrı ayrı takip edilir
  const [selections, setSelections] = useState<Record<string, ProductVariantDto | null>>({})
  const [errorGroups, setErrorGroups] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)
  const variantRef = useRef<HTMLDivElement>(null)

  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer } = useCartStore()
  const queryClient = useQueryClient()
  const { push: pushRecent } = useRecentlyViewed()
  const router = useRouter()

  // Wishlist başlangıç durumu — sayfa açılınca kontrol et
  const { data: isInWishlist } = useQuery({
    queryKey: QUERY_KEYS.wishlist.check(product.id),
    queryFn: () => wishlistApi.check(product.id),
    enabled: !!token,
    staleTime: 60_000,
  })
  useEffect(() => {
    if (isInWishlist !== undefined) setWishlisted(isInWishlist)
  }, [isInWishlist])

  // Track recently viewed once on mount — pushRecent writes to localStorage only, no setState
  const trackedRef = useRef<null | true>(null)
  if (trackedRef.current == null) {
    trackedRef.current = true
    pushRecent({
      id:       product.id,
      slug:     product.slug,
      name:     product.name,
      price:    product.price,
      imageUrl: product.imageUrl ?? product.images?.[0]?.imageUrl ?? null,
    })
  }

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const savings = hasDiscount ? product.comparePrice! - product.price : 0

  // Stok: beden varyantı seçildiyse onun stoğu, yoksa ürün stoğu
  const selectedSize = selections['Beden'] ?? null
  const selectedColor = selections['Renk'] ?? null
  const activeVariant = selectedSize ?? selectedColor ?? null
  // Stok her zaman ürün seviyesinden — varyant stoğu 0 olsa bile ürünün stoğu geçerli
  // (Beden varyantları admin panelinden stock:0 oluşturulsa da ürünün kendisi stokluysa göster)
  const effectiveStock = product.stock
  const isOutOfStock = effectiveStock === 0
  const maxQty = Math.min(effectiveStock, 10)
  const displayPrice = product.price + (activeVariant?.priceModifier ?? 0)
  const needsForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - displayPrice * quantity)
  const hasFreeShipping = displayPrice * quantity >= FREE_SHIPPING_THRESHOLD

  const cartMutation = useMutation({
    mutationFn: () => cartApi.addItem({ productId: product.id, variantId: activeVariant?.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      openDrawer()
      toast.success('Ürün sepete eklendi')
    },
    onError: () => toast.error('Sepete eklenemedi'),
  })

  const buyNowMutation = useMutation({
    mutationFn: () => cartApi.addItem({ productId: product.id, variantId: activeVariant?.id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      router.push('/odeme')
    },
    onError: () => toast.error('Bir hata oluştu, tekrar deneyin'),
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

    // Hangi gruplar zorunlu ama seçilmedi?
    const groups = groupVariants(product.variants ?? [])
    const missing: string[] = []

    // Beden varsa beden seçimi zorunlu
    if (groups['Beden']?.length && !selections['Beden']) missing.push('Beden')
    // Renk tek grup ise renk seçimi zorunlu
    if (!groups['Beden']?.length && groups['Renk']?.length && !selections['Renk']) missing.push('Renk')

    if (missing.length > 0) {
      setErrorGroups(missing)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error(`Lütfen ${missing.join(' ve ')} seçin`)
      return
    }

    setErrorGroups([])
    cartMutation.mutate()
  }

  const handleBuyNow = () => {
    if (!token) { openAuthModal('login'); return }

    const groups = groupVariants(product.variants ?? [])
    const missing: string[] = []
    if (groups['Beden']?.length && !selections['Beden']) missing.push('Beden')
    if (!groups['Beden']?.length && groups['Renk']?.length && !selections['Renk']) missing.push('Renk')

    if (missing.length > 0) {
      setErrorGroups(missing)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error(`Lütfen ${missing.join(' ve ')} seçin`)
      return
    }

    setErrorGroups([])
    buyNowMutation.mutate()
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

        {/* Materyal rozetleri */}
        {(product.material || product.fitType) && (
          <div className="flex flex-wrap gap-2 mt-2">
            {product.material && (
              <span className="text-xs font-bold px-2.5 py-1 bg-navy-dark text-white rounded-full">
                {product.material}
              </span>
            )}
            {product.fitType && (
              <span className="text-xs font-bold px-2.5 py-1 bg-orange text-white rounded-full">
                {product.fitType} Kesim
              </span>
            )}
          </div>
        )}
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
          variants={product.variants ?? []}
          selections={selections}
          onSelect={(groupName, v) => {
            setSelections(prev => ({ ...prev, [groupName]: v }))
            setErrorGroups(prev => prev.filter(g => g !== groupName))
          }}
          errorGroups={errorGroups}
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
      <div className="space-y-2.5">
        {/* Hemen Al */}
        {!isOutOfStock && (
          <button
            onClick={handleBuyNow}
            disabled={buyNowMutation.isPending}
            className="w-full flex items-center justify-center gap-2 border-2 border-orange
                       text-orange hover:bg-orange hover:text-white active:scale-[0.98]
                       font-extrabold py-4 rounded-2xl transition-all
                       disabled:opacity-60 disabled:cursor-not-allowed text-[15px]"
          >
            <Zap size={18} />
            {buyNowMutation.isPending ? 'Yönlendiriliyor…' : 'Hemen Al'}
          </button>
        )}

        {/* Sepete Ekle + Favori */}
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
          {/* Trendyol açıklamaları ";." ile ayrılmış cümleler içerir — madde listesi olarak göster */}
          {product.description.includes(';') ? (
            <ul className="space-y-1.5">
              {product.description
                .split(/[;]+/)
                .map(s => s.replace(/^[\s.]+|[\s.]+$/g, ''))
                .filter(s => s.length > 4)
                .slice(0, 8)
                .map((sentence, i) => (
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

      {/* Özellikler — checkmark listesi */}
      {(() => {
        const features = [
          product.material          && `${product.material} kumaş`,
          product.fabricComposition && product.fabricComposition,
          product.fitType           && `${product.fitType} kesim`,
          product.careInstructions  && product.careInstructions,
          product.season            && `${product.season} sezonu uygun`,
        ].filter(Boolean) as string[]
        if (!features.length) return null
        return (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-extrabold text-gray-800 mb-3">Özellikler</h3>
            <ul className="space-y-2">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-orange flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )
      })()}

      {/* Ürün Özellikleri — teknik grid */}
      {(product.material || product.fabricComposition || product.careInstructions ||
        product.fitType  || product.gender            || product.season           ||
        product.originCountry) && (
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-extrabold text-gray-800 mb-3">Ürün Detayları</h3>
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
  )
}
