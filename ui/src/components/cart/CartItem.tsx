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

/* Stable color from product name — gives each item a consistent pastel */
function nameToColor(name: string): string {
  const COLORS = [
    'from-pink-200 to-rose-300',
    'from-blue-200 to-indigo-300',
    'from-amber-200 to-orange-300',
    'from-green-200 to-emerald-300',
    'from-purple-200 to-violet-300',
    'from-teal-200 to-cyan-300',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

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

  useEffect(() => {
    if (debouncedQty !== item.quantity) {
      updateMutation.mutate(debouncedQty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQty])

  const maxQty = Math.min(item.availableStock, 10)
  const colorClass = nameToColor(item.productName)

  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-100 last:border-0 group">
      {/* Product avatar */}
      <Link
        href={`/urunler/${item.productId}`}
        className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${colorClass}
                    flex items-center justify-center font-extrabold text-xl text-white/90
                    shadow-sm hover:scale-105 transition-transform select-none`}
      >
        {item.productName.charAt(0).toUpperCase()}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Name */}
        <Link
          href={`/urunler/${item.productId}`}
          className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug
                     hover:text-orange transition-colors"
        >
          {item.productName}
        </Link>

        {/* Variant + color/size badges */}
        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {item.variantName && (
            <span className="inline-block text-[10px] bg-gray-100 text-gray-600 font-medium
                             px-2 py-0.5 rounded-full">
              {item.variantName}
            </span>
          )}
          {item.color && item.color !== item.variantName && (
            <span className="inline-block text-[10px] bg-gray-100 text-gray-600 font-medium
                             px-2 py-0.5 rounded-full">
              {item.color}
            </span>
          )}
          {item.size && item.size !== item.variantName && (
            <span className="inline-block text-[10px] bg-gray-100 text-gray-600 font-medium
                             px-2 py-0.5 rounded-full">
              Beden: {item.size}
            </span>
          )}
        </div>

        {/* Qty + price row */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || updateMutation.isPending}
              className="w-7 h-7 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus size={11} />
            </button>
            <span className="w-8 text-center text-xs font-extrabold text-navy-dark">
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              disabled={qty >= maxQty || updateMutation.isPending}
              className="w-7 h-7 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Price + delete */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-navy-dark">
              {formatPrice(item.unitPrice * qty)}
            </span>
            <button
              onClick={() => removeMutation.mutate()}
              disabled={removeMutation.isPending}
              aria-label="Ürünü kaldır"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300
                         hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40
                         opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Stock warnings */}
        {item.availableStock <= 3 && item.availableStock > 0 && (
          <p className="text-[10px] text-orange font-bold mt-1">
            ⚡ Son {item.availableStock} ürün!
          </p>
        )}
        {item.availableStock === 0 && (
          <p className="text-[10px] text-red-500 font-bold mt-1">Stokta kalmadı</p>
        )}
      </div>
    </div>
  )
}
