'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ShoppingBag, Star } from 'lucide-react'
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
    // Eğer varyant varsa ürün detay sayfasına yönlendir
    setAddingCart(true)
    try {
      const { cartApi } = await import('@/domains/cart/cart.api')
      await cartApi.addItem({ productId: product.id, quantity: 1 })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      openDrawer()
    } catch {
      // Varyant gerekiyorsa detay sayfasına yönlendir — Link zaten var
    } finally {
      setAddingCart(false)
    }
  }

  return (
    <Link
      href={`/urunler/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100
                 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-200 block"
    >
      {/* Görsel */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200 text-5xl font-bold select-none">
            ?
          </div>
        )}

        {/* Rozetler */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="bg-red-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded">
              -{discountPct}%
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-gray-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              Tükendi
            </span>
          )}
        </div>

        {/* Wishlist butonu */}
        <button
          onClick={handleWishlist}
          aria-label="Favorilere ekle"
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center
                      transition-all duration-200 opacity-0 group-hover:opacity-100
                      ${wishlisted
                        ? 'bg-red-50 text-red-500'
                        : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
        >
          <Heart size={15} className={wishlisted ? 'fill-red-500' : ''} />
        </button>

        {/* Sepete ekle — hover overlay */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            disabled={addingCart}
            className="absolute bottom-0 left-0 right-0 bg-navy-dark/90 text-white text-xs font-bold
                       py-2.5 flex items-center justify-center gap-1.5 translate-y-full
                       group-hover:translate-y-0 transition-transform duration-200 backdrop-blur-sm"
          >
            <ShoppingBag size={13} />
            {addingCart ? 'Ekleniyor…' : 'Sepete Ekle'}
          </button>
        )}
      </div>

      {/* Bilgi */}
      <div className="p-3">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide truncate">
          {product.categoryName}
        </p>
        <p className="text-[13px] font-semibold text-gray-800 line-clamp-2 leading-snug mt-0.5">
          {product.name}
        </p>

        {/* Rating */}
        {product.totalReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] text-gray-500">
              {product.averageRating.toFixed(1)}
              <span className="text-gray-400"> ({product.totalReviews})</span>
            </span>
          </div>
        )}

        {/* Fiyat */}
        <div className="flex items-baseline gap-1.5 mt-1.5">
          <span className="text-sm font-extrabold text-navy-dark">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-gray-400 line-through">
              {formatPrice(product.comparePrice!)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
