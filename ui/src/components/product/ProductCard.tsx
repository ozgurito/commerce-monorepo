'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useCartStore } from '@/store/cart.store'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'
import type { ProductDto } from '@/domains/products/products.types'

interface Props {
  product: ProductDto
  priority?: boolean
}

type Stamp = { lines: [string, string]; bg: string }

function getStamp(product: ProductDto, discountPct: number, isOutOfStock: boolean): Stamp | null {
  if (isOutOfStock) return null
  if (product.totalReviews >= 50)
    return { lines: ['EN ÇOK', 'SATAN'], bg: 'bg-orange' }
  if (discountPct >= 25)
    return { lines: ['AVANTAJLI', 'ÜRÜN'], bg: 'bg-emerald-500' }
  if (product.stock > 0 && product.stock <= 10)
    return { lines: ['SON', 'ÜRÜNLER'], bg: 'bg-red-500' }
  return null
}

export function ProductCard({ product, priority = false }: Props) {
  const [wishlisted, setWishlisted] = useState(false)
  const [addingCart, setAddingCart] = useState(false)
  const { token } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const { openDrawer } = useCartStore()
  const queryClient = useQueryClient()

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
      // Varyant gerekiyorsa detay sayfasına yönlendir
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
              className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center
                            text-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
              <ShoppingBag size={40} className="text-gray-200" />
            </div>
          )}
        </div>

        {/* Top badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold
                             px-2 py-0.5 rounded-lg shadow-sm">
              %{discountPct} İNDİRİM
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700/90 backdrop-blur-sm text-white text-[10px]
                             font-bold px-2 py-0.5 rounded-lg">
              Tükendi
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

        {/* Dairesel damga rozeti — sol alt */}
        {stamp && (
          <div className={`absolute bottom-10 left-2 z-10 w-[52px] h-[52px] rounded-full
                           ${stamp.bg} text-white
                           flex flex-col items-center justify-center
                           border-2 border-white/30 shadow-lg`}>
            {stamp.lines.map((line, i) => (
              <span key={i} className="text-[8px] font-extrabold leading-tight tracking-tight">
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

        {/* Free shipping badge */}
        {product.price >= 150 && (
          <p className="text-[10px] text-green-600 font-semibold mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
            Ücretsiz kargo
          </p>
        )}
      </div>

      {/* Alt hover çizgisi */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-orange to-orange-dark
                      scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Link>
  )
}
