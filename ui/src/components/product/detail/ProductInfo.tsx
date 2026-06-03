'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ShoppingBag, Star, Minus, Plus, Truck, RotateCcw, Shield, Share2, Check, ShoppingCart, Zap, Clock, MapPin, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { cartApi } from '@/domains/cart/cart.api'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice, FREE_SHIPPING_ITEM_COUNT, SHIPPING_COST } from '@/utils/format'
import { VariantSelector, groupVariants } from './VariantSelector'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { ProductDetailDto, ProductVariantDto } from '@/domains/products/products.types'

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
}

export function ProductInfo({ product }: Props) {
  // Beden ve renk grupları ayrı ayrı takip edilir
  const [selections, setSelections] = useState<Record<string, ProductVariantDto | null>>({})
  const [errorGroups, setErrorGroups] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
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

  // Saatlik değişen sayılar (her tam saatte güncellenir)
  useEffect(() => {
    const calc = () => {
      const hourSlot = Math.floor(Date.now() / (1000 * 60 * 60))       // saatte 1 değişir
      const biHourSlot = Math.floor(Date.now() / (1000 * 60 * 60 * 2)) // 2 saatte 1 değişir
      setSoldLastHour(seedNum(product.id * 13 + hourSlot,    3, 12))
      setInCartCount(seedNum(product.id * 7  + biHourSlot,   8, 28))
    }
    calc()
    // Her dakika kontrol et — saat değişince otomatik güncellenir
    const id = setInterval(calc, 60_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  // "Şu an inceliyor" — 30 saniyede bir hafif değişim (2–9 aralığı)
  useEffect(() => {
    const base = seedNum(product.id * 3, 2, 9)
    setViewersNow(base)
    const id = setInterval(() => {
      setViewersNow(Math.max(1, base + Math.floor(Math.random() * 3) - 1))
    }, 30_000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer, itemCount: cartItemCount } = useCartStore()
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
  
  // Kombinasyon arayışı: Hem seçili beden hem de seçili renkle eşleşen bir varyant var mı?
  let activeVariant = null
  if (product.variants?.length) {
    if (selectedSize && selectedColor) {
      activeVariant = product.variants.find(v => v.size === selectedSize.size && v.color === selectedColor.color)
    }
    // Kombinasyon bulunamadıysa (veya sadece biri seçiliyse) seçili olanı kullan
    if (!activeVariant) {
      activeVariant = selectedSize ?? selectedColor ?? null
    }
  }

  // Stok her zaman ürün seviyesinden — varyant stoğu 0 olsa bile ürünün stoğu geçerli
  // (Beden varyantları admin panelinden stock:0 oluşturulsa da ürünün kendisi stokluysa göster)
  const effectiveStock = product.stock
  const isOutOfStock = effectiveStock === 0
  const maxQty = effectiveStock
  const displayPrice = product.price + (activeVariant?.priceModifier ?? 0)
  const totalCartItems = cartItemCount + quantity   // sepetteki + şu an seçili adet
  const hasFreeShipping = totalCartItems >= FREE_SHIPPING_ITEM_COUNT
  const itemsUntilFree = Math.max(0, FREE_SHIPPING_ITEM_COUNT - totalCartItems)

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
    // Renk grubu varsa (COMBINED veya tek renk) renk seçimi zorunlu
    if (groups['Renk']?.length && !selections['Renk']) missing.push('Renk')

    if (missing.length > 0) {
      setErrorGroups(missing)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error(`Lütfen ${missing.join(' ve ')} seçin`)
      return
    }

    // Seçili kombine varyantın stoğu yoksa engelle
    if (activeVariant && activeVariant.stock === 0) {
      toast.error('Seçili beden/renk kombinasyonu stokta kalmadı')
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
    if (groups['Renk']?.length && !selections['Renk']) missing.push('Renk')

    if (missing.length > 0) {
      setErrorGroups(missing)
      variantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      toast.error(`Lütfen ${missing.join(' ve ')} seçin`)
      return
    }

    // Seçili kombine varyantın stoğu yoksa engelle
    if (activeVariant && activeVariant.stock === 0) {
      toast.error('Seçili beden/renk kombinasyonu stokta kalmadı')
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
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-500
                       hover:text-orange transition-colors px-2.5 py-1.5 rounded-xl
                       border border-gray-200 hover:border-orange/40 bg-white"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Share2 size={16} />}
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

      {/* Sosyal kanıt */}
      {!isOutOfStock && (
        <div className="space-y-2">
          {/* Şu an inceliyor */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 border border-blue-100
                          rounded-xl px-3 py-2">
            <Users size={14} className="text-blue-500 flex-shrink-0" />
            <span>
              Şu an{' '}
              <strong className="text-blue-700">{Math.max(1, viewersNow)} kişi</strong>
              {' '}bu ürünü inceliyor
            </span>
          </div>

          {/* Son saatte satış */}
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 border border-orange-100
                          rounded-xl px-3 py-2">
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
                  <strong className="text-orange">{itemsUntilFree} ürün</strong>
                  {' '}daha ekle, kargo bedava!
                </span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange to-orange-dark rounded-full
                               transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (totalCartItems / FREE_SHIPPING_ITEM_COUNT) * 100)}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 text-right">
                {totalCartItems}/{FREE_SHIPPING_ITEM_COUNT} ürün
              </p>
            </div>
          )}
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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

    </div>
  )
}
