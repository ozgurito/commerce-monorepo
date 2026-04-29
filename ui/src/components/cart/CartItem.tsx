'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPrice } from '@/utils/format'
import type { CartItemDto } from '@/domains/cart/cart.types'

interface Props {
  item: CartItemDto
}

export function CartItem({ item }: Props) {
  const [qty, setQty] = useState(item.quantity)
  const debouncedQty = useDebounce(qty, 800)
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: (quantity: number) => cartApi.updateItem(item.id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all }),
    onError: () => {
      setQty(item.quantity)
      toast.error('Miktar güncellenemedi')
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => cartApi.removeItem(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      toast.success('Ürün sepetten kaldırıldı')
    },
    onError: () => toast.error('Ürün kaldırılamadı'),
  })

  // 800ms debounce sonrası API'ya gönder
  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      updateMutation.mutate(debouncedQty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQty])

  const maxQty = Math.min(item.availableStock, 10)

  return (
    <div className="flex gap-3 py-4 border-b border-gray-100 last:border-0">
      {/* Görsel placeholder — CartItemDto'da imageUrl yok */}
      <Link
        href={`/urunler/${item.productId}`}
        className="flex-shrink-0 w-16 h-16 rounded-xl bg-navy-50 flex items-center justify-center
                   text-navy-dark font-extrabold text-lg hover:opacity-80 transition-opacity"
      >
        {item.productName.charAt(0).toUpperCase()}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/urunler/${item.productId}`}
          className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug
                     hover:text-orange transition-colors"
        >
          {item.productName}
        </Link>

        {item.variantName && (
          <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          {/* Miktar */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || updateMutation.isPending}
              className="w-7 h-7 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus size={12} />
            </button>
            <span className="w-7 text-center text-xs font-bold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty || updateMutation.isPending}
              className="w-7 h-7 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Fiyat + sil */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-navy-dark">
              {formatPrice(item.unitPrice * qty)}
            </span>
            <button
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
              aria-label="Ürünü kaldır"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400
                         hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {item.availableStock <= 3 && item.availableStock > 0 && (
          <p className="text-[10px] text-orange font-semibold mt-1">
            Son {item.availableStock} ürün!
          </p>
        )}
        {item.availableStock === 0 && (
          <p className="text-[10px] text-red-500 font-semibold mt-1">Stokta kalmadı</p>
        )}
      </div>
    </div>
  )
}
