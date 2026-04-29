// DiscountType enum — PERCENTAGE | FIXED_AMOUNT | FREE_SHIPPING
export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'

export interface CouponDto {
  id: number
  code: string
  description: string | null
  discountType: DiscountType
  discountValue: number
  minimumOrderAmount: number | null   // NOT minOrderAmount
  maximumDiscountAmount: number | null
  usageLimit: number | null           // NOT maxUsageCount
  usageLimitPerUser: number | null
  usedCount: number                   // NOT usageCount
  startsAt: string | null
  expiresAt: string | null
  firstOrderOnly: boolean
  isActive: boolean
  isValid: boolean
  createdAt: string
}

// ApplyCouponRequest — sadece code (orderAmount göndermiyoruz)
export interface ApplyCouponRequest {
  code: string
}

export interface ApplyCouponResponse {
  success: boolean
  message: string
  couponCode: string              // NOT code
  discountType: DiscountType
  discountAmount: number
  originalTotal: number           // NOT finalAmount
  newTotal: number
}
