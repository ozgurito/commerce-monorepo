import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface GuestCartItem {
  productId: number
  variantId: number | null
  quantity: number
  // Sadece görüntüleme için önbellek — girişte birleştirirken backend fiyat/stoğu kendi belirler
  name: string
  slug: string
  price: number
  imageUrl: string | null
  variantLabel: string | null   // "M - Mavi" gibi
  maxStock: number
}

interface GuestCartState {
  items: GuestCartItem[]
  addItem: (item: Omit<GuestCartItem, 'quantity'>, qty: number) => void
  updateQuantity: (productId: number, variantId: number | null, qty: number) => void
  removeItem: (productId: number, variantId: number | null) => void
  clear: () => void
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, qty) =>
        set((s) => {
          const idx = s.items.findIndex(
            (i) => i.productId === item.productId && i.variantId === item.variantId
          )
          if (idx >= 0) {
            const items = [...s.items]
            items[idx] = {
              ...items[idx],
              quantity: Math.min(items[idx].quantity + qty, item.maxStock),
            }
            return { items }
          }
          return { items: [...s.items, { ...item, quantity: Math.min(qty, item.maxStock) }] }
        }),

      updateQuantity: (productId, variantId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId && i.variantId === variantId ? { ...i, quantity: qty } : i
          ),
        })),

      removeItem: (productId, variantId) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.productId === productId && i.variantId === variantId)),
        })),

      clear: () => set({ items: [] }),
    }),
    { name: 'guest-cart-storage' }
  )
)

/**
 * Girişten hemen sonra çağrılır — misafir sepetini gerçek (backend) sepetle birleştirir.
 * Fiyat/stok client'tan gönderilmez; backend addToCart her satırı kendi fiyat/stok
 * bilgisiyle yeniden hesaplar (bkz. CartService.addToCart), o yüzden localStorage'daki
 * önbellek tutarsız olsa da nihai tutarı etkilemez.
 */
export async function mergeGuestCartIntoServerCart(): Promise<void> {
  const { items, clear } = useGuestCartStore.getState()
  if (items.length === 0) return

  const { cartApi } = await import('@/domains/cart/cart.api')
  for (const item of items) {
    try {
      await cartApi.addItem({
        productId: item.productId,
        variantId: item.variantId ?? undefined,
        quantity: item.quantity,
      })
    } catch {
      // Ürün/varyant artık mevcut değil ya da stok yetersiz — sessizce atla,
      // kullanıcı gerçek sepette güncel durumu görecek.
    }
  }
  clear()
}
