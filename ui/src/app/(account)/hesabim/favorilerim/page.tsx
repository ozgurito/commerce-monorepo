'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Loader2, ShoppingBag, Trash2, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { wishlistApi } from '@/domains/wishlist/wishlist.api'
import { cartApi } from '@/domains/cart/cart.api'
import { useCartStore } from '@/store/cart.store'
import { formatPrice } from '@/utils/format'
import { QUERY_KEYS } from '@/lib/query-keys'

export default function FavorilerimPage() {
  const queryClient = useQueryClient()
  const { syncFromCart } = useCartStore()

  const { data: items = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.wishlist.all,
    queryFn: wishlistApi.getAll,
  })

  const removeMutation = useMutation({
    mutationFn: (productId: number) => wishlistApi.remove(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.all })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.wishlist.count })
      toast.success('Favorilerden kaldırıldı')
    },
  })

  const addToCartMutation = useMutation({
    mutationFn: (productId: number) => cartApi.addItem({ productId, quantity: 1 }),
    onSuccess: (cart) => {
      const count = cart.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)
      syncFromCart(count, cart.totalAmount)
      toast.success('Sepete eklendi! 🛒')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Sepete eklenemedi')
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={28} className="text-orange animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Heart size={22} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-extrabold text-navy-dark">Favorilerim</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {items.length > 0
              ? `${items.length} ürün kaydedildi`
              : 'Beğendiğiniz ürünleri kaydedin'}
          </p>
        </div>
        {items.length > 0 && (
          <span className="flex items-center gap-1 text-xs font-bold text-red-500
                           bg-red-50 border border-red-100 rounded-full px-3 py-1.5 flex-shrink-0">
            <Heart size={11} className="fill-red-400" />
            {items.length} Favori
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-14 text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center
                          mx-auto mb-4">
            <Heart size={32} className="text-red-200" />
          </div>
          <p className="font-bold text-gray-600 mb-1">Favori listeniz boş</p>
          <p className="text-sm text-gray-400 mb-6">
            Beğendiğiniz ürünlerin ❤️ ikonuna tıklayarak favorilere ekleyin
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white
                       font-bold px-6 py-3 rounded-xl transition-colors text-sm
                       shadow-md shadow-orange/20"
          >
            <ShoppingBag size={16} />
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden
                         hover:border-orange/20 hover:shadow-[0_4px_20px_rgba(0,0,0,.07)]
                         transition-all group"
            >
              {/* Image */}
              <Link href={`/urunler/${item.productSlug}`}
                className="block relative aspect-[4/3] overflow-hidden bg-gray-50">
                {item.productImageUrl ? (
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-gray-200" />
                  </div>
                )}

                {/* Stock badge */}
                {!item.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-500 text-white text-xs font-extrabold
                                     px-3 py-1 rounded-full">
                      Stokta Yok
                    </span>
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    removeMutation.mutate(item.productId)
                  }}
                  disabled={removeMutation.isPending}
                  className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md
                             flex items-center justify-center text-red-400 hover:text-red-500
                             hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link href={`/urunler/${item.productSlug}`}>
                  <p className="text-sm font-semibold text-navy-dark hover:text-orange
                                transition-colors line-clamp-2 leading-snug mb-1">
                    {item.productName}
                  </p>
                </Link>

                {/* Rating placeholder */}
                <div className="flex items-center gap-0.5 mb-2">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={10}
                      className={s <= 4 ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="font-extrabold text-orange text-base">
                    {formatPrice(item.productPrice)}
                  </p>
                  <button
                    onClick={() => addToCartMutation.mutate(item.productId)}
                    disabled={!item.inStock || addToCartMutation.isPending}
                    className="flex items-center gap-1.5 text-xs font-bold bg-orange hover:bg-orange-dark
                               text-white py-2 px-3 rounded-xl transition-colors disabled:opacity-50
                               shadow-sm shadow-orange/20"
                  >
                    <ShoppingBag size={13} />
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
