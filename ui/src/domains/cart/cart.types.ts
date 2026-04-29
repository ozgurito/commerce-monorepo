export type CartStatus = 'ACTIVE' | 'ORDERED' | 'ABANDONED'

export interface CartItemDto {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  availableStock: number  // NOT item.variant?.stock — direkt burada
  variantId: number | null
  variantName: string | null   // "M - Mavi" gibi
  size: string | null
  color: string | null
}

export interface CartDto {
  id: number
  userId: number
  items: CartItemDto[]
  status: CartStatus
  totalAmount: number
  itemCount: number
}

export interface AddToCartRequest {
  productId: number
  quantity: number
  variantId?: number
}

export interface UpdateCartItemRequest {
  quantity: number
}
