// Gerçek OrderStatus enum (CONFIRMED/PREPARING yok — PAID/PROCESSING var)
export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'

export interface Address {
  fullName: string
  phone: string
  addressLine: string
  city: string
  district: string
  postalCode: string
  country: string
}

export interface OrderItemDto {
  id: number
  productId: number
  productName: string
  imageUrl?: string | null
  variantId: number | null
  variantName: string | null
  size?: string | null
  color?: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface OrderDto {
  id: number
  orderNumber: string
  userId: number
  userEmail: string
  items: OrderItemDto[]
  subtotal: number
  tax: number
  shippingCost: number
  total: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: PaymentMethod
  paymentId: string | null
  shippingAddress: Address
  billingAddress: Address
  couponCode: string | null
  discountAmount: number
  createdAt: string
  updatedAt: string
}

export interface OrderItemRequest {
  productId: number
  variantId?: number
  quantity: number
}

// CreateOrderRequest — shippingAddress/billingAddress Address objesi olarak (flat field değil)
export interface CreateOrderRequest {
  items: OrderItemRequest[]
  shippingAddress: Address
  billingAddress: Address
  notes?: string
  couponCode?: string
  paymentMethod?: PaymentMethod
  guestEmail?: string
}

// GuestOrderRequest — items + Address objeleri (flat shippingAddressLine1 yok)
export interface GuestOrderRequest {
  guestEmail: string
  items: OrderItemRequest[]
  shippingAddress: Address
  billingAddress: Address
  notes?: string
  couponCode?: string
  paymentMethod?: PaymentMethod
}
