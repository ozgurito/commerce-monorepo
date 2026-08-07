'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, Star, Eye, Zap, Users } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { useGuestCartStore } from '@/store/guest-cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import { getProductBadge } from '@/utils/product-badge'
import type { ProductDto } from '@/domains/products/products.types'

// Ürün ID + günlük slot → her gün farklı, küçük mağaza ölçeği
function seedViews(id: number): number {
  const daySlot = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const x = Math.sin((id + daySlot) * 9301 + 49297) * 233280
  return 20 + Math.floor((x - Math.floor(x)) * 130) // 20–150 arası
}

interface Props {
  product: ProductDto
  priority?: boolean
}

function getStamp(product: ProductDto, discountPct: number, isOutOfStock: boolean) {
  return getProductBadge({
    totalReviews: product.totalReviews,
    averageRating: product.averageRating,
    stock: product.stock,
    discountPct,
    isOutOfStock,
  })
}

/**
 * ProductCard'ın renk-farkındalıklı hali — kategori/arama listelerinde her renk
 * ayrı kart olarak açıldığında kullanılır (bkz. ProductsView, expandByColor).
 * Ana sayfa küratörlü bölümleri (öne çıkanlar, yeni gelenler) hâlâ orijinal
 * ProductCard'ı kullanıyor, bu bileşen sadece renk-bazlı listeleme içindir.
 */
export function ProductVariantCard({ product, priority = false }: Props) {
  const [wishlisted, setWishlisted] = useState(false)
  const [addingCart, setAddingCart] = useState(false)

  const [views, setViews] = useState(() => seedViews(product.id))
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.25) setViews(v => Math.min(220, v + 1))
    }, 6000)
    return () => clearInterval(id)
  }, [])
  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer } = useCartStore()
  const queryClient = useQueryClient()
  const router = useRouter()

  const hasDiscount = product.comparePrice && product.comparePrice > product.price
  const discountPct = hasDiscount
    ? Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)
    : 0
  const isOutOfStock = product.stock === 0
  const stamp = getStamp(product, discountPct, isOutOfStock)

  // Bu kartın rengi varsa detay sayfası linkine ekleniyor — PDP o rengi baştan seçili açar
  const renkParam = product.variantColor ? `?renk=${encodeURIComponent(product.variantColor)}` : ''
  const href = `/urunler/${product.slug}${renkParam}`

  const wishlistMutation = useMutation({
    mutationFn: () =>
      wishlisted ? wishlistApi.remove(product.id) : wishlistApi.add(product.id),
    onSuccess: () => {
      setWishlisted((w) => !w)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.all })
    },
  })

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!token) { openAuthModal('login'); return }
    wishlistMutation.mutate()
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) return
    setAddingCart(true)
    try {
      if (!token) {
        useGuestCartStore.getState().addItem({
          productId: product.id,
          variantId: null,
          name: product.name,
          slug: product.slug,
          price: product.price,
          imageUrl: product.imageUrl ?? null,
          variantLabel: product.variantColor ?? null,
          maxStock: product.stock,
        }, 1)
        openDrawer()
        return
      }
      const { cartApi } = await import('@/domains/cart/cart.api')
      await cartApi.addItem({ productId: product.id, quantity: 1 })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      openDrawer()
    } catch {
      // Varyant seçimi gerekiyor → bu kartın rengi baştan seçili şekilde detay sayfasına yönlendir
      router.push(href)
    } finally {
      setAddingCart(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={10}
        className={i < Math.round(rating)
          ? 'text-amber-400 fill-amber-400'
          : 'text-gray-200 fill-gray-200'}
      />
    ))
  }

  return (
    <Link
      href={href}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-[0_8px_30px_rgba(0,0,0,.12)] hover:-translate-y-1
                 transition-all duration-250 block relative"
    >
      {/* Image area */}
      <div className="relative overflow-hidden bg-gray-50"
           style={{ paddingBottom: '133%' }}>
        <div className="absolute inset-0">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.variantColor ? `${product.name} — ${product.variantColor}` : product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              priority={priority}
              className="object-contain group-hover:scale-[1.06] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
              <span className="text-5xl font-extrabold text-gray-300 select-none leading-none tracking-tighter">
                {product.name.charAt(0).toUpperCase()}
              </span>
              {product.categoryName && (
                <span className="text-[10px] font-semibold text-gray-400 mt-2 uppercase tracking-wider">
                  {product.categoryName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="flex items-center gap-0.5 text-white text-[11px] font-extrabold
                             px-2 py-1 rounded-lg shadow-lg
                             bg-gradient-to-r from-red-500 to-orange-500
                             animate-[pulse_2s_ease-in-out_infinite]
                             ring-1 ring-white/20">
              <Zap size={9} className="fill-white flex-shrink-0" />
              %{discountPct} İNDİRİM
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700/90 backdrop-blur-sm text-white text-[10px]
                             font-bold px-2 py-0.5 rounded-lg">
              Tükendi
            </span>
          )}
          {!isOutOfStock && product.stock > 0 && product.stock <= 5 && (
            <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px]
                             font-extrabold px-2 py-0.5 rounded-lg shadow-sm animate-pulse">
              Son {product.stock} ürün!
            </span>
          )}
          {!hasDiscount && !isOutOfStock && product.totalReviews === 0 && (
            <span className="bg-navy text-white text-[10px] font-extrabold
                             px-2 py-0.5 rounded-lg shadow-sm">
              YENİ
            </span>
          )}
        </div>

        {/* Wishlist + quick view — always visible on mobile, hover on desktop */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10
                        opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            aria-label="Favorilere ekle"
            className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center
                        transition-all duration-200 backdrop-blur-sm
                        ${wishlisted
                          ? 'bg-red-500 text-white'
                          : 'bg-white/90 text-gray-500 hover:bg-red-50 hover:text-red-500'}`}
          >
            <Heart size={14} className={wishlisted ? 'fill-white' : ''} />
          </button>
          <button
            aria-label="Hızlı önizleme"
            className="w-8 h-8 rounded-full bg-white/90 shadow-md flex items-center justify-center
                       text-gray-500 hover:bg-navy hover:text-white transition-all duration-200
                       backdrop-blur-sm"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Trendyol tarzı yuvarlak rozet — sol alt */}
        {stamp && (
          <div className={`absolute bottom-10 left-2 z-10 w-[62px] h-[62px] rounded-full
                           ${stamp.bg} text-white
                           flex flex-col items-center justify-center
                           border-[3px] border-white/40 shadow-xl`}>
            <Star size={12} className="fill-white text-white mb-0.5 opacity-90" />
            {stamp.lines.map((line, i) => (
              <span key={i} className="text-[7.5px] font-extrabold leading-tight tracking-tight text-center px-1">
                {line}
              </span>
            ))}
          </div>
        )}

        {/* Add to cart overlay — slides up on hover */}
        {!isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full
                          group-hover:translate-y-0 transition-transform duration-250 z-10">
            <button
              onClick={handleAddToCart}
              disabled={addingCart}
              className="w-full bg-navy-dark/95 hover:bg-orange text-white text-xs font-bold
                         py-3 flex items-center justify-center gap-2 transition-colors
                         backdrop-blur-sm border-t border-white/10 disabled:opacity-70"
            >
              <ShoppingBag size={13} />
              {addingCart ? 'Ekleniyor…' : 'Sepete Ekle'}
            </button>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="p-3">
        {/* Category + renk */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider truncate">
            {product.categoryName}
          </p>
          {product.variantColor && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <span
                className="w-2.5 h-2.5 rounded-full border border-gray-200"
                style={{ backgroundColor: product.variantColorHex ?? '#ccc' }}
              />
              <span className="text-[10px] text-gray-400 font-medium">{product.variantColor}</span>
            </span>
          )}
        </div>

        {/* Product name */}
        <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug">
          {product.name}
        </p>

        {/* Rating */}
        {product.totalReviews > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex items-center gap-0.5">
              {renderStars(product.averageRating)}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">
              {product.averageRating.toFixed(1)}
            </span>
            <span className="text-[11px] text-gray-400">
              ({product.totalReviews})
            </span>
          </div>
        )}

        {/* Sosyal kanıt — 24 saatte X kişi inceledi */}
        {!isOutOfStock && (
          <div className="flex items-center gap-1 mt-1">
            <Users size={9} className="text-gray-400 flex-shrink-0" />
            <span className="text-[10px] text-gray-400">
              24 saatte{' '}
              <strong className="text-gray-600">{views.toLocaleString('tr-TR')}</strong>
              {' '}kişi inceledi
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[15px] font-extrabold text-orange">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[12px] text-gray-400 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>

      </div>

      {/* Alt hover çizgisi */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange to-orange-dark
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  )
}
