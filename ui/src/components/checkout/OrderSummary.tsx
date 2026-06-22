import { formatPrice, FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from '@/utils/format'
import type { CartDto } from '@/domains/cart/cart.types'

interface Props {
  cart: CartDto
  couponCode?: string | null
  discountAmount?: number | null
}

export function OrderSummary({ cart, couponCode, discountAmount }: Props) {
  const discount = discountAmount ?? 0
  const discountedSubtotal = Math.max(0, cart.totalAmount - discount)
  // Kargo: ara toplam (indirim öncesi) ≥ 1000₺ → ücretsiz; altında 29,90₺. Kupon kargoyu etkilemez.
  const shipping = cart.totalAmount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
  const grandTotal = discountedSubtotal + shipping

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h3 className="font-extrabold text-navy-dark mb-4">Sipariş Özeti</h3>

      {/* Ürünler */}
      <div className="space-y-4 mb-5 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 rounded-2xl bg-gray-50/50 border border-transparent hover:border-gray-100 transition-colors">
            {/* Ürün Resmi */}
            <div className="relative w-16 h-20 sm:w-20 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm bg-white">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-full h-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full bg-navy-50 flex items-center justify-center text-navy-dark font-extrabold text-xl">
                  {item.productName.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Adet Badge */}
              <div className="absolute top-0 right-0 bg-navy-dark/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-bl-xl shadow-sm">
                {item.quantity} Adet
              </div>
            </div>

            {/* Ürün Detayları */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <p 
                className="text-[13px] sm:text-sm font-bold text-navy-dark leading-snug line-clamp-2 cursor-help"
                title={item.productName}
              >
                {item.productName}
              </p>
              
              {/* Variant (Renk / Beden) */}
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                {item.variantName && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">
                    {item.variantName}
                  </span>
                )}
                {item.color && item.color !== item.variantName && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">
                    Renk: {item.color}
                  </span>
                )}
                {item.size && item.size !== item.variantName && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-gray-500 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-sm">
                    Beden: {item.size}
                  </span>
                )}
              </div>
              
              <div className="mt-auto pt-2 flex items-center justify-between">
                <span className="text-sm sm:text-base font-extrabold text-orange">
                  {formatPrice(item.totalPrice)}
                </span>
                {item.quantity > 1 && (
                  <span className="text-[10px] text-gray-400 font-medium">
                    (Birim: {formatPrice(item.totalPrice / item.quantity)})
                  </span>
                )}
              </div>
            </div>
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
