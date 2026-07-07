'use client'
import Link from 'next/link'
import { Minus, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatPrice } from '@/utils/format'
import { useGuestCartStore, type GuestCartItem as GuestCartItemType } from '@/store/guest-cart.store'

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
  item: GuestCartItemType
}

export function GuestCartItem({ item }: Props) {
  const { updateQuantity, removeItem } = useGuestCartStore()
  const maxQty = Math.max(1, item.maxStock)
  const colorClass = nameToColor(item.name)

  const handleRemove = () => {
    removeItem(item.productId, item.variantId)
    toast.success('Ürün sepetten kaldırıldı')
  }

  return (
    <div className="flex gap-3 py-3.5 border-b border-gray-100 last:border-0 group">
      {/* Product image */}
      <Link
        href={`/urunler/${item.slug}`}
        className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden hover:scale-105 transition-transform"
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${colorClass}
                          flex items-center justify-center font-extrabold text-xl text-white/90`}>
            {item.name.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        {/* Name */}
        <Link
          href={`/urunler/${item.slug}`}
          title={item.name}
          className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug
                     hover:text-orange transition-colors"
        >
          {item.name}
        </Link>

        {/* Variant badge */}
        {item.variantLabel && (
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="inline-block text-[10px] bg-gray-100 text-gray-600 font-medium
                             px-2 py-0.5 rounded-full">
              {item.variantLabel}
            </span>
          </div>
        )}

        {/* Qty + price row */}
        <div className="flex items-center justify-between mt-2">
          {/* Quantity stepper */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => updateQuantity(item.productId, item.variantId, Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Minus size={11} />
            </button>
            <span className="w-8 text-center text-xs font-extrabold text-navy-dark">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.variantId, Math.min(maxQty, item.quantity + 1))}
              disabled={item.quantity >= maxQty}
              className="w-7 h-7 flex items-center justify-center text-gray-500
                         hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Price + delete */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-navy-dark">
              {formatPrice(item.price * item.quantity)}
            </span>
            <button
              onClick={handleRemove}
              aria-label="Ürünü kaldır"
              className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300
                         hover:bg-red-50 hover:text-red-500 transition-colors
                         sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
