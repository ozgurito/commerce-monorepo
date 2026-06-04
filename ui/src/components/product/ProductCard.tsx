'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Heart, ShoppingBag, Star, Eye, Zap, Users } from 'lucide-react'

// Ürün ID + günlük slot → her gün farklı, küçük mağaza ölçeği
function seedViews(id: number): number {
  const daySlot = Math.floor(Date.now() / (1000 * 60 * 60 * 24))
  const x = Math.sin((id + daySlot) * 9301 + 49297) * 233280
  return 20 + Math.floor((x - Math.floor(x)) * 130) // 20–150 arası
}

const CARD_GRADIENTS = [
  'from-pink-300 to-rose-400',
  'from-blue-300 to-indigo-400',
  'from-amber-300 to-orange-400',
  'from-green-300 to-emerald-400',
  'from-purple-300 to-violet-400',
  'from-teal-300 to-cyan-400',
  'from-red-300 to-pink-400',
  'from-sky-300 to-blue-400',
]

function nameToGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return CARD_GRADIENTS[Math.abs(hash) % CARD_GRADIENTS.length]
}
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import { getProductBadge } from '@/utils/product-badge'
import type { ProductDto } from '@/domains/products/products.types'

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

export function ProductCard({ product, priority = false }: Props) {
  const [wishlisted, setWishlisted] = useState(false)
  const [addingCart, setAddingCart] = useState(false)
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
    if (!token) { openAuthModal('login'); return }
    if (isOutOfStock) return
    setAddingCart(true)
    try {
      const { cartApi } = await import('@/domains/cart/cart.api')
      await cartApi.addItem({ productId: product.id, quantity: 1 })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      openDrawer()
    } catch {
      // Varyant seçimi gerekiyor → detay sayfasına yönlendir
      router.push(`/urunler/${product.slug}`)
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
      href={`/urunler/${product.slug}`}
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
              alt={product.name}
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
        {/* Category */}
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider truncate mb-0.5">
          {product.categoryName}
        </p>

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
              <strong className="text-gray-600">{seedViews(product.id).toLocaleString('tr-TR')}</strong>
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
