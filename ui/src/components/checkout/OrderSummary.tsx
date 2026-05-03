import { formatPrice } from '@/utils/format'
import type { CartDto } from '@/domains/cart/cart.types'

interface Props {
  cart: CartDto
  couponCode?: string | null
  discountAmount?: number | null
}

export function OrderSummary({ cart, couponCode, discountAmount }: Props) {
  const discount = discountAmount ?? 0
  const discountedSubtotal = Math.max(0, cart.totalAmount - discount)
  const shipping = discountedSubtotal >= 150 ? 0 : 29.90
  const grandTotal = discountedSubtotal + shipping

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-extrabold text-navy-dark mb-4">Sipariş Özeti</h3>

      {/* Ürünler */}
      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
        {cart.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-navy-50 flex items-center justify-center
                                text-navy-dark font-bold text-sm">
                  {item.productName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">{item.productName}</p>
              {item.variantName && (
                <p className="text-[10px] text-gray-400">{item.variantName}</p>
              )}
              <p className="text-[10px] text-gray-400">×{item.quantity}</p>
            </div>
            <span className="text-xs font-bold text-navy-dark flex-shrink-0">
              {formatPrice(item.totalPrice)}
            </span>
          </div>
        ))}
      </div>

      {/* Toplamlar */}
      <div className="border-t border-gray-100 pt-3 space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Ara Toplam</span>
          <span>{formatPrice(cart.totalAmount)}</span>
        </div>
        {couponCode && discount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600 font-semibold">
            <span>Kupon ({couponCode})</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {couponCode && discount === 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>Kupon ({couponCode})</span>
            <span>Uygulandı</span>
          </div>
        )}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Kargo</span>
          <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
            {shipping === 0 ? 'Ücretsiz' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex items-center justify-between font-extrabold text-navy-dark
                        pt-2 border-t border-gray-100">
          <span>Toplam</span>
          <span className="text-lg">{formatPrice(grandTotal)}</span>
        </div>
      </div>
    </div>
  )
}
