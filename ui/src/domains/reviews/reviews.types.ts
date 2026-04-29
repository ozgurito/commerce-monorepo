export interface ReviewDto {
  id: number
  productId: number
  productName: string
  userId: number
  userName: string
  rating: number
  title: string | null
  comment: string | null
  images: string[]
  verifiedPurchase: boolean
  approved: boolean
  featured: boolean
  helpfulCount: number
  unhelpfulCount: number
  adminResponse: string | null
  adminResponseAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ReviewCreateRequest {
  productId: number
  rating: number
  title?: string
  comment?: string
}
