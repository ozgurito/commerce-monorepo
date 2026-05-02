import apiClient from '@/lib/api-client'
import type { DashboardStatsDto, LowStockAlertDto } from './admin.types'
import type { OrderDto } from '@/domains/orders/orders.types'
import type { OrderStatus } from '@/domains/orders/orders.types'
import type { ProductDto, ProductDetailDto, ProductVariantDto } from '@/domains/products/products.types'
import type { CategoryDto } from '@/domains/categories/categories.types'
import type { ReviewDto } from '@/domains/reviews/reviews.types'
import type { CouponDto } from '@/domains/coupons/coupons.types'
import type { PagedOrders } from '@/domains/orders/orders.api'

export interface PagedProducts {
  content: ProductDto[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
}

export interface PagedReviewsAdmin {
  content: ReviewDto[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
}

export interface PagedCoupons {
  content: CouponDto[]
  totalElements: number
  totalPages: number
  number: number
  last: boolean
}

export interface CreateProductRequest {
  name: string
  description: string
  price: number
  comparePrice?: number
  stock: number
  sku: string
  categoryId: number
  featured?: boolean
  isActive?: boolean
  material?: string
  fabricComposition?: string
  careInstructions?: string
  fitType?: string
  gender?: string
  season?: string
}

export interface CreateCategoryRequest {
  name: string
  slug?: string
  description?: string
  parentId?: number
  displayOrder?: number
  isActive?: boolean
  imageUrl?: string
  metaTitle?: string
  metaDescription?: string
}

export interface CreateCouponRequest {
  code: string
  description?: string
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING'
  discountValue: number
  minimumOrderAmount?: number
  maximumDiscountAmount?: number
  usageLimit?: number
  usageLimitPerUser?: number
  startsAt?: string
  expiresAt?: string
  firstOrderOnly?: boolean
  isActive?: boolean
}

export interface CreateVariantRequest {
  variantType: 'SIZE' | 'COLOR'
  name: string       // @NotBlank — backend field adı
  size?: string      // SIZE varyantı için
  color?: string     // COLOR varyantı için
  colorHex?: string
  stock: number      // @NotNull — default 0
}

export const adminApi = {
  // --- Dashboard ---
  getStats: async (): Promise<DashboardStatsDto> => {
    const { data } = await apiClient.get('/api/admin/stats')
    return data
  },

  getLowStock: async (): Promise<LowStockAlertDto[]> => {
    const { data } = await apiClient.get('/api/products/low-stock')
    return data
  },

  // --- Orders ---
  getOrders: async (page = 0, size = 20, status?: string): Promise<PagedOrders> => {
    const { data } = await apiClient.get('/api/admin/orders', {
      params: { page, size, ...(status ? { status } : {}) },
    })
    return data
  },

  getOrder: async (id: number): Promise<OrderDto> => {
    const { data } = await apiClient.get(`/api/admin/orders/${id}`)
    return data
  },

  updateOrderStatus: async (id: number, status: OrderStatus): Promise<OrderDto> => {
    const { data } = await apiClient.put(`/api/orders/${id}/status`, { status })
    return data
  },

  // --- Products ---
  getProducts: async (page = 0, size = 20, keyword?: string): Promise<PagedProducts> => {
    const { data } = await apiClient.get('/api/products', {
      params: { page, size, ...(keyword ? { keyword } : {}) },
    })
    return data
  },

  getProduct: async (id: number): Promise<ProductDetailDto> => {
    const { data } = await apiClient.get(`/api/products/${id}/detail`)
    return data
  },

  createProduct: async (req: CreateProductRequest): Promise<ProductDetailDto> => {
    const { data } = await apiClient.post('/api/products', req)
    return data
  },

  updateProduct: async (id: number, req: Partial<CreateProductRequest>): Promise<ProductDetailDto> => {
    const { data } = await apiClient.put(`/api/products/${id}`, req)
    return data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`)
  },

  // --- Image upload ---
  getUploadUrl: async (fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> => {
    const { data } = await apiClient.post('/api/assets/upload-url', { fileName, contentType })
    return data
  },

  addProductImage: async (productId: number, imageUrl: string, isPrimary = false): Promise<void> => {
    await apiClient.post(`/api/products/${productId}/images`, { imageUrl, isPrimary })
  },

  deleteProductImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/api/products/${productId}/images/${imageId}`)
  },

  setPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.put(`/api/products/${productId}/images/${imageId}/primary`)
  },

  // --- Variants ---
  getVariants: async (productId: number): Promise<ProductVariantDto[]> => {
    const { data } = await apiClient.get(`/api/products/${productId}/variants`)
    return data
  },

  createVariant: async (productId: number, req: CreateVariantRequest): Promise<ProductVariantDto> => {
    const { data } = await apiClient.post(`/api/products/${productId}/variants`, req)
    return data
  },

  updateVariant: async (productId: number, variantId: number, req: Partial<CreateVariantRequest>): Promise<ProductVariantDto> => {
    const { data } = await apiClient.put(`/api/products/${productId}/variants/${variantId}`, req)
    return data
  },


  deleteVariant: async (productId: number, variantId: number): Promise<void> => {
    await apiClient.delete(`/api/products/${productId}/variants/${variantId}`)
  },

  // --- Categories ---
  createCategory: async (req: CreateCategoryRequest): Promise<CategoryDto> => {
    const { data } = await apiClient.post('/api/categories', req)
    return data
  },

  updateCategory: async (id: number, req: Partial<CreateCategoryRequest>): Promise<CategoryDto> => {
    const { data } = await apiClient.put(`/api/categories/${id}`, req)
    return data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/categories/${id}`)
  },

  // --- Reviews ---
  getReviews: async (page = 0, size = 20, approved?: boolean): Promise<PagedReviewsAdmin> => {
    const { data } = await apiClient.get('/api/reviews/pending', {
      params: { page, size, ...(approved !== undefined ? { approved } : {}) },
    })
    return data
  },

  approveReview: async (id: number): Promise<ReviewDto> => {
    const { data } = await apiClient.put(`/api/reviews/${id}/approve`)
    return data
  },

  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/reviews/${id}`)
  },

  respondToReview: async (id: number, response: string): Promise<ReviewDto> => {
    const { data } = await apiClient.put(`/api/reviews/${id}/admin-response`, { response })
    return data
  },

  // --- Coupons ---
  getCoupons: async (page = 0, size = 20): Promise<PagedCoupons> => {
    const { data } = await apiClient.get('/api/coupons', { params: { page, size } })
    return data
  },

  createCoupon: async (req: CreateCouponRequest): Promise<CouponDto> => {
    const { data } = await apiClient.post('/api/coupons', req)
    return data
  },

  updateCoupon: async (id: number, req: Partial<CreateCouponRequest>): Promise<CouponDto> => {
    const { data } = await apiClient.put(`/api/coupons/${id}`, req)
    return data
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/coupons/${id}`)
  },
}
