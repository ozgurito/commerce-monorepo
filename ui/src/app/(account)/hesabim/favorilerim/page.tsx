'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Heart, Loader2, ShoppingBag, Trash2 } from 'lucide-react'
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
    mutationFn: (productId: number) =>
      cartApi.addItem({ productId, quantity: 1 }),
    onSuccess: (cart) => {
      const count = cart.items.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0)
      syncFromCart(count, cart.totalAmount)
      toast.success('Sepete eklendi')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-navy-dark">Favorilerim</h1>
        {items.length > 0 && (
          <span className="text-sm text-gray-400">{items.length} ürün</span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-500 mb-1">Favori listeniz boş</p>
          <p className="text-sm text-gray-400 mb-6">Beğendiğiniz ürünleri favorilere ekleyin</p>
          <Link
            href="/urunler"
            className="inline-block bg-orange hover:bg-orange-dark text-white font-bold
                       px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4"
            >
              {/* Görsel */}
              <Link href={`/urunler/${item.productSlug}`} className="flex-shrink-0">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 relative">
                  {item.productImageUrl ? (
                    <Image
                      src={item.productImageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Bilgi */}
              <div className="flex-1 min-w-0">
                <Link href={`/urunler/${item.productSlug}`}>
                  <p className="text-sm font-semibold text-navy-dark hover:text-orange
                                transition-colors line-clamp-2 leading-snug">
                    {item.productName}
                  </p>
                </Link>
                <p className="font-extrabold text-orange mt-1">
                  {formatPrice(item.productPrice)}
                </p>
                {!item.inStock && (
                  <p className="text-xs text-red-500 mt-0.5">Stokta yok</p>
                )}

                {/* Aksiyonlar */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => addToCartMutation.mutate(item.productId)}
                    disabled={!item.inStock || addToCartMutation.isPending}
                    className="flex-1 text-xs font-bold bg-orange hover:bg-orange-dark text-white
                               py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Sepete Ekle
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(item.productId)}
                    disabled={removeMutation.isPending}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50
                               rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
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
