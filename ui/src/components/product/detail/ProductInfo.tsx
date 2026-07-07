'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield, Share2, Check, ShoppingCart, Zap, Clock, MapPin, Users, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { cartApi } from '@/domains/cart/cart.api'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { useGuestCartStore } from '@/store/guest-cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice, FREE_SHIPPING_THRESHOLD } from '@/utils/format'
import { getProductBadge } from '@/utils/product-badge'
import { VariantSelector, groupVariants } from './VariantSelector'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { ProductDetailDto, ProductVariantDto, ProductImageDto } from '@/domains/products/products.types'

// FREE_SHIPPING_THRESHOLD utils/format.ts'den import ediliyor

/* ── Kargo tahmini hesaplayıcı ── */
const TR_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date)
  let added = 0
  while (added < days) {
    result.setDate(result.getDate() + 1)
    const day = result.getDay()
    if (day !== 0 && day !== 6) added++ // 0=Pazar, 6=Cumartesi atla
  }
  return result
}

function getShippingEstimate() {
  const now = new Date()
  const hour = now.getHours()
  const cutoffHour = 14
  const isBeforeCutoff = hour < cutoffHour

  // Kargo başlangıç günü: saat 14 öncesiyse bugün, sonrasıysa yarın iş günü
  const shipDay = isBeforeCutoff ? new Date(now) : addBusinessDays(now, 1)
  const minDelivery = addBusinessDays(shipDay, 1)
  const maxDelivery = addBusinessDays(shipDay, 3)

  const fmt = (d: Date) => `${TR_DAYS[d.getDay()]} ${d.getDate()} ${TR_MONTHS[d.getMonth()]}`

  return {
    isBeforeCutoff,
    minLabel: fmt(minDelivery),
    maxLabel: fmt(maxDelivery),
    sameMinMax: minDelivery.toDateString() === maxDelivery.toDateString(),
  }
}

interface Props {
  product: ProductDetailDto
  onGalleryChange?: (index: number) => void
  onColorSelect?: (color: string) => void  // renk seçilince activeColor'u güncelle
  imageClickColor?: string | null
  imagesHaveVariants?: boolean
}

export function ProductInfo({ product, onGalleryChange, onColorSelect, imageClickColor, imagesHaveVariants }: Props) {
  // Beden ve renk grupları ayrı ayrı takip edilir
  const [selections, setSelections] = useState<Record<string, ProductVariantDto | null>>({})
  const [errorGroups, setErrorGroups] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)

  // Swatch scroll ref
  const swatchScrollRef = useRef<HTMLDivElement>(null)
  const [swatchCanLeft,  setSwatchCanLeft]  = useState(false)
  const [swatchCanRight, setSwatchCanRight] = useState(false)

  useEffect(() => {
    const el = swatchScrollRef.current
    if (!el) return
    const update = () => {
      setSwatchCanLeft(el.scrollLeft > 4)
      setSwatchCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [imagesHaveVariants, product.images])

  // ── Renk → ilk görsel map + swatch listesi ──
  const { colorToFirstImage, colorSwatches } = useMemo(() => {
    const map: Record<string, number> = {}
    const swatches: { color: string; image: ProductImageDto }[] = []
    const sorted = [...(product.images ?? [])].sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1
      if (!a.isPrimary && b.isPrimary) return 1
      return a.displayOrder - b.displayOrder
    })
    sorted.forEach((img, idx) => {
      if (img.variantColor && !(img.variantColor in map)) {
        map[img.variantColor] = idx
        swatches.push({ color: img.variantColor, image: img })
      }
    })
    return { colorToFirstImage: map, colorSwatches: swatches }
  }, [product.images])
  const [wishlisted, setWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewersNow, setViewersNow]   = useState(0)
  const [soldLastHour, setSoldLastHour] = useState(0)
  const [inCartCount, setInCartCount]   = useState(0)
  const variantRef = useRef<HTMLDivElement>(null)

  // Seed helper — deterministik ama zaman + ID kombinasyonu ile değişebilir
  const seedNum = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280
    return min + Math.floor((x - Math.floor(x)) * (max - min))
  }

  // Sosyal kanıt sayaçları — ürüne özgü tohumdan başlar, sonra birkaç saniyede bir
  // küçük adımlarla (random walk) sınırlar içinde canlı oynar → sürekli dinamik his.
  useEffect(() => {
    setViewersNow(seedNum(product.id * 3, 3, 9))
    setSoldLastHour(seedNum(product.id * 13, 4, 12))
    setInCartCount(seedNum(product.id * 7, 9, 24))

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
    const drift = () => (Math.random() < 0.5 ? -1 : 1)

    const id = setInterval(() => {
      // "Şu an inceliyor" → ANLIK metrik, gelen-giden olur (artıp azalabilir)
      setViewersNow(v => clamp(v + drift(), 2, 12))
      // "Son 1 saatte satıldı" → KÜMÜLATİF, azalmaz; ara sıra +1 artar
      if (Math.random() < 0.12) setSoldLastHour(v => clamp(v + 1, 3, 18))
      // "Sepette" → ANLIK (ekleyen-çıkaran olur), yavaşça artıp azalabilir
      if (Math.random() < 0.3) setInCartCount(v => clamp(v + drift(), 8, 30))
    }, 5000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  // Görsel tıklanınca → o görselin rengi otomatik seçilir
  useEffect(() => {
    if (!imageClickColor || !product.variants?.length) return
    const variant = product.variants.find(
      v => v.color?.toLowerCase() === imageClickColor.toLowerCase()
    )
    if (variant) {
      setSelections(prev => ({ ...prev, 'Renk': variant }))
      setErrorGroups(prev => prev.filter(g => g !== 'Renk'))
    }
  }, [imageClickColor, product.variants])

  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer, itemCount: cartItemCount, totalAmount: cartTotalAmount } = useCartStore()
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

  // Stok: Seçili Beden ve Renk kombinasyonuna uygun varyantı bulmaya çalış
  const selectedSize = selections['Beden'] ?? null
  const selectedColor = selections['Renk'] ?? null

  // Varyant grupları — renk/beden seçenek sayısı. 1 ise gerçek bir seçim yok (tek renk/tek beden)
  // → seçim zorunlu DEĞİL ve otomatik kullanılır ki doğru variantId sepete gitsin.
  const variantGroups = useMemo(() => groupVariants(product.variants ?? []), [product.variants])
  const colorOptions = variantGroups['Renk'] ?? []
  const sizeOptions = variantGroups['Beden'] ?? []
  const colorRequired = colorOptions.length > 1
  const sizeRequired = sizeOptions.length > 1

  // Tek seçenekli boyut/renk kullanıcı seçmese de otomatik devreye girer
  const effectiveColor = selectedColor ?? (colorOptions.length === 1 ? colorOptions[0] : null)
  const effectiveSize = selectedSize ?? (sizeOptions.length === 1 ? sizeOptions[0] : null)

  // Kombinasyon arayışı: Hem beden hem renkle eşleşen bir varyant var mı?
  let activeVariant = null
  if (product.variants?.length) {
    if (effectiveSize && effectiveColor) {
      activeVariant = product.variants.find(v => v.size === effectiveSize.size && v.color === effectiveColor.color)
    }
    // Kombinasyon bulunamadıysa (veya sadece biri varsa) onu kullan
    if (!activeVariant) {
      activeVariant = effectiveSize ?? effectiveColor ?? null
    }
  }

  // Stok her zaman ürün seviyesinden — varyant stoğu 0 olsa bile ürünün stoğu geçerli
  // (Beden varyantları admin panelinden stock:0 oluşturulsa da ürünün kendisi stokluysa göster)
  const effectiveStock = product.stock
  const isOutOfStock = effectiveStock === 0
  const maxQty = effectiveStock
  const displayPrice = product.price + (activeVariant?.priceModifier ?? 0)
  // Kargo fiyat bazlı: sepet parasal toplamı + şu an seçili miktar × birim fiyat ≥ 1000₺ → ücretsiz
  const cartMoneyTotal = cartTotalAmount + displayPrice * quantity
  const hasFreeShipping = cartMoneyTotal >= FREE_SHIPPING_THRESHOLD
  const amountUntilFree = Math.max(0, FREE_SHIPPING_THRESHOLD - cartMoneyTotal)

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

  // Varyant seçim/stok doğrulaması ortak — hem sepete ekle hem hemen al kullanır
  const validateSelection = (): boolean => {
    const missing: string[] = []
    if (sizeRequired && !selections['Beden']) missing.push('Beden')
    if (colorRequired && !selections['Renk']) missing.push('Renk')

    if (missing.length > 0) {
      setErrorGroups(missing)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error(`Lütfen ${missing.join(' ve ')} seçin`)
      return false
    }

    if ((selectedSize || selectedColor) && activeVariant && activeVariant.stock === 0) {
      toast.error('Seçili beden/renk kombinasyonu stokta kalmadı')
      return false
    }

    setErrorGroups([])
    return true
  }

  const addToGuestCart = () => {
    // Seçili rengin görseli varsa onu kullan — yoksa ürünün genel görseline düş
    // (sipariş/sepet detayında yanlış renk görünmesin diye backend'deki aynı mantık).
    const colorImage = effectiveColor?.color
      ? colorSwatches.find(cs => cs.color === effectiveColor.color)?.image.imageUrl
      : null

    useGuestCartStore.getState().addItem({
      productId: product.id,
      variantId: activeVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      imageUrl: colorImage ?? product.imageUrl ?? product.images?.[0]?.imageUrl ?? null,
      variantLabel: [effectiveSize?.size, effectiveColor?.color].filter(Boolean).join(' - ') || null,
      maxStock: effectiveStock,
    }, quantity)
  }

  const handleAddToCart = () => {
    if (!validateSelection()) return

    // Giriş yapılmamışsa misafir sepetine ekle — üyelik yalnızca ödeme adımında istenir
    if (!token) {
      addToGuestCart()
      openDrawer()
      toast.success('Ürün sepete eklendi')
      return
    }

    cartMutation.mutate()
  }

  const handleBuyNow = () => {
    if (!validateSelection()) return

    if (!token) {
      addToGuestCart()
      toast.success('Ürün sepete eklendi, satın almak için giriş yapmanız gerekiyor')
      openAuthModal('login')
      return
    }

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
        {/* Ürün rozeti — Trendyol tarzı (Avantajlı, Seçkin, En Çok Satan...) */}
        {(() => {
          const badge = getProductBadge({
            totalReviews: product.totalReviews,
            averageRating: product.averageRating,
            stock: product.stock,
            discountPct,
            isOutOfStock,
          })
          if (!badge) return null
          return (
            <div className={`inline-flex items-center gap-1.5 ${badge.bg} ${badge.textColor}
                             text-xs font-extrabold px-3 py-1.5 rounded-full mb-3
                             shadow-sm tracking-wide`}>
              <Star size={11} className="fill-current flex-shrink-0" />
              {badge.lines.join(' ')}
            </div>
          )
        })()}

        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-orange uppercase tracking-widest">
            {product.categoryName}
          </p>
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 text-sm font-semibold transition-colors
                       px-2.5 py-1.5 rounded-xl border bg-white
                       ${copied
                         ? 'text-green-600 border-green-300'
                         : 'text-orange border-orange/40 hover:bg-orange/5'}`}
          >
            {copied
              ? <Check size={15} className="text-green-500" />
              : <Share2 size={15} className="animate-blink" />}
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
        <div className="space-y-2 pb-3 border-b border-gray-100">
          {/* Yıldız + puan + yorum sayısı */}
          <div className="flex items-center gap-3">
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

          {/* Rating badge — Trendyol tarzı segmentasyon */}
          {product.averageRating >= 4.5 && product.totalReviews >= 5 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700
                            bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              Kullanıcılar Beğeniyor!
            </div>
          )}
          {product.averageRating >= 4.0 && product.averageRating < 4.5 && product.totalReviews >= 2 && (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700
                            bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
              <Star size={11} className="fill-purple-500 text-purple-500" />
              Seçkin Ürün
            </div>
          )}
        </div>
      )}

      {/* Sosyal kanıt — küçük kutular + her birinde canlı yanıp sönen nokta */}
      {!isOutOfStock && (
        <div className="space-y-1.5">
          {/* Şu an inceliyor */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100
                          rounded-xl px-3 py-2">
            <span className="relative flex h-2 w-2 flex-shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>
            <span>
              Şu an{' '}
              <strong className="text-blue-700">{Math.max(1, viewersNow)} kişi</strong>
              {' '}bu ürünü inceliyor
            </span>
          </div>

          {/* Son saatte satış */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 border border-orange-100
                          rounded-xl px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-orange flex-shrink-0 animate-blink" />
            <TrendingUp size={14} className="text-orange flex-shrink-0" />
            <span>
              Son 1 saatte{' '}
              <strong className="text-orange">{soldLastHour} adet</strong>
              {' '}satıldı
            </span>
          </div>

          {/* Sepetinde */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-amber-50 border border-amber-100
                          rounded-xl px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-amber-500 flex-shrink-0 animate-blink" />
            <ShoppingCart size={14} className="text-amber-500 flex-shrink-0" />
            <span>
              <strong className="text-gray-800">{inCartCount} kişinin</strong>
              {' '}sepetinde, tükenmeden al!
            </span>
          </div>
        </div>
      )}

      {/* Price section */}
      <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
        <div className="flex items-end gap-3">
          <span className="text-2xl sm:text-[2rem] font-extrabold text-orange leading-none">
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

      {/* ── Görsel bazlı renk seçimi — Trendyol tarzı ── */}
      {imagesHaveVariants && colorSwatches.length > 1 && (
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2.5">
            Renk:{' '}
            <span className="font-extrabold text-navy-dark">
              {selections['Renk']?.color
                ? <>{selections['Renk']!.color} <span className="text-xs text-gray-400 font-normal">(görselden seçildi)</span></>
                : <span className="text-gray-400 font-normal text-xs">Görsele tıklayarak seçin</span>
              }
            </span>
          </p>

          <div className="relative">
            {swatchCanLeft && (
              <button
                onClick={() => swatchScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white
                           shadow-md rounded-full flex items-center justify-center
                           text-gray-500 hover:text-orange -translate-x-1">
                <ChevronLeft size={14} />
              </button>
            )}

            <div ref={swatchScrollRef}
                 className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 px-0.5">
              {colorSwatches.map(({ color, image }) => {
                const isSelected = selections['Renk']?.color === color
                const firstIdx = colorToFirstImage[color] ?? 0
                return (
                  <button
                    key={color}
                    onClick={() => {
                      // Renk varyantını seç
                      const variant = product.variants?.find(v => v.color === color) ?? null
                      if (variant) {
                        setSelections(prev => ({ ...prev, 'Renk': variant }))
                        setErrorGroups(prev => prev.filter(g => g !== 'Renk'))
                      }
                      onColorSelect?.(color)   // activeColor güncelle → gallery filtrele
                      onGalleryChange?.(firstIdx)
                    }}
                    title={color}
                    className="flex-shrink-0 flex flex-col items-center gap-1"
                  >
                    <div className={`w-[60px] h-[60px] rounded-xl overflow-hidden border-2
                                     transition-all duration-200
                                     ${isSelected
                                       ? 'border-orange scale-105 shadow-md'
                                       : 'border-gray-200 hover:border-gray-400'}`}>
                      <Image
                        src={image.imageUrl}
                        alt={color}
                        width={60}
                        height={60}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <span className={`text-[10px] font-semibold leading-none
                                      ${isSelected ? 'text-orange' : 'text-gray-500'}`}>
                      {color}
                    </span>
                  </button>
                )
              })}
            </div>

            {swatchCanRight && (
              <button
                onClick={() => swatchScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-white
                           shadow-md rounded-full flex items-center justify-center
                           text-gray-500 hover:text-orange translate-x-1">
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}

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

      {/* Görsel bazlı renk seçimi aktifse seçili renk adını göster */}
      {imagesHaveVariants && selections['Renk']?.color && (
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-600">Renk:</span>
          <span className="font-extrabold text-navy-dark">{selections['Renk'].color}</span>
          <span className="text-xs text-gray-400">(görselden seçildi)</span>
        </div>
      )}
      {imagesHaveVariants && colorSwatches.length > 1 && !selections['Renk'] && (
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span>👆</span> Görsele tıklayarak renk seçin
        </p>
      )}

      {/* Variant selector — görseller variant bilgisi taşıyorsa renk swatchları thumbnail üzerinden seçilir */}
      <div ref={variantRef}>
        <VariantSelector
          variants={product.variants ?? []}
          selections={selections}
          hideColorSwatches={imagesHaveVariants}
          onSelect={(groupName, v) => {
            setSelections(prev => ({ ...prev, [groupName]: v }))
            setErrorGroups(prev => prev.filter(g => g !== groupName))
            // Renk seçilince → o rengin ilk görselini gallery'de göster
            if (groupName === 'Renk' && v.color && v.color in colorToFirstImage) {
              onGalleryChange?.(colorToFirstImage[v.color])
            }
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
          {effectiveStock <= 20 && (
            <span className="text-xs text-gray-400">Stok: {effectiveStock}</span>
          )}
        </div>
      )}

      {/* Kampanya kutusu */}
      {(hasDiscount || hasFreeShipping || product.stock > 100) && (
        <div className="border border-orange/20 rounded-xl p-3 bg-orange/[0.03] space-y-1.5">
          <p className="text-[11px] font-extrabold text-orange uppercase tracking-wide">Ürün Kampanyaları</p>
          {hasFreeShipping && (
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

      {/* CTA Buttons — Trendyol tarzı tek satır: [Hemen Al] [Sepete Ekle] [❤] */}
      <div className="flex gap-2.5 items-stretch">
        {/* Hemen Al */}
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || buyNowMutation.isPending}
          className="flex-1 flex items-center justify-center gap-1.5 border-2 border-orange
                     text-orange hover:bg-orange hover:text-white active:scale-[0.98]
                     font-extrabold py-4 rounded-2xl transition-all text-[14px]
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Zap size={16} />
          {buyNowMutation.isPending ? 'Yönlendiriliyor…' : 'Hemen Al'}
        </button>

        {/* Sepete Ekle */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || cartMutation.isPending}
          className="flex-[1.4] flex items-center justify-center gap-1.5 bg-orange hover:bg-orange-dark
                     active:scale-[0.98] text-white font-extrabold py-4 rounded-2xl transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-orange/25
                     text-[14px]"
        >
          <ShoppingBag size={16} />
          {isOutOfStock ? 'Stokta Yok' : cartMutation.isPending ? 'Ekleniyor…' : 'Sepete Ekle'}
        </button>

        {/* Favori — yuvarlak */}
        <button
          onClick={() => { if (!token) { openAuthModal('login'); return }; wishlistMutation.mutate() }}
          aria-label="Favorilere ekle"
          className={`w-14 rounded-2xl border-2 flex items-center justify-center transition-all
                      active:scale-95 flex-shrink-0
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
              <Truck size={16} className="flex-shrink-0" />
              <span className="text-sm font-bold">Sepetinde ücretsiz kargo var! 🎉</span>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <Truck size={15} className="text-orange flex-shrink-0" />
                <span className="text-sm">
                  <strong className="text-orange">{formatPrice(amountUntilFree)}</strong>
                  {' '}daha ekle, kargo bedava!
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange to-orange-dark rounded-full
                               transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (cartMoneyTotal / FREE_SHIPPING_THRESHOLD) * 100)}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {formatPrice(cartMoneyTotal)} / {formatPrice(FREE_SHIPPING_THRESHOLD)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shield,    label: 'Güvenli Ödeme', sub: '256-bit SSL' },
          { icon: RotateCcw, label: '14 Gün İade',    sub: 'Yasal Süre' },
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

      {/* Kargo Tahmini */}
      {!isOutOfStock && (() => {
        const { isBeforeCutoff, minLabel, maxLabel, sameMinMax } = getShippingEstimate()
        return (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-3.5">
            <Truck size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-emerald-700">
                  {isBeforeCutoff ? '🚀 Bugün kargolanır' : '📦 Yarın kargolanır'}
                </p>
                {isBeforeCutoff && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold flex-shrink-0">
                    <Clock size={10} />
                    14:00'e kadar
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-600 mt-0.5">
                Tahmini teslimat:{' '}
                <strong>
                  {sameMinMax ? minLabel : `${minLabel} – ${maxLabel}`}
                </strong>
              </p>
              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-gray-400">
                <MapPin size={10} />
                <span>Türkiye geneli (Yurt içi kargo)</span>
              </div>
            </div>
          </div>
        )
      })()}

      <div id="debug-variants" className="hidden">
        {JSON.stringify(product.variants)}
      </div>

      {/* Model No — müşteri servis referansı için (WhatsApp sorguları) */}
      {product.sku && (
        <p className="text-[10px] text-gray-300 font-mono text-right pt-1">
          Model: {product.sku}
        </p>
      )}

      {/* Mobil sabit alt bar — fiyat + Hemen Al + Sepete Ekle, scroll boyunca ekranda kalır.
          Bu sayfada genel MobileBottomNav gizlenir (bkz. MobileBottomNav.tsx), o yüzden bar bottom-0'a oturur.
          MobileBottomNav.tsx ile BİREBİR AYNI yapı kullanılıyor (fixed bottom-0 + sadece
          env(safe-area-inset-bottom) padding, transform/GPU-layer hack'i olmadan) — o zaten
          sorunsuz çalışıyor, burada da aynı davranışı garantiler. */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200
                      shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="px-3 py-2.5 flex items-center gap-2">
          <div className="flex flex-col leading-none flex-shrink-0 max-w-[26%]">
            <span className="text-base font-extrabold text-orange truncate">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through truncate">
                {formatPrice(product.comparePrice!)}
              </span>
            )}
          </div>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock || buyNowMutation.isPending}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-orange
                       text-orange active:scale-[0.98] font-extrabold py-3 rounded-xl transition-all
                       text-[13px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Zap size={14} />
            Hemen Al
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || cartMutation.isPending}
            className="flex-[1.4] flex items-center justify-center gap-1 bg-orange active:scale-[0.98]
                       text-white font-extrabold py-3 rounded-xl transition-all text-[13px]
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-orange/25"
          >
            <ShoppingBag size={14} />
            {isOutOfStock ? 'Stokta Yok' : cartMutation.isPending ? 'Ekleniyor…' : 'Sepete Ekle'}
          </button>
        </div>
      </div>

    </div>
  )
}
