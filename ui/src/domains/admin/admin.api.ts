import apiClient from '@/lib/api-client'
import type { DashboardStatsDto, LowStockAlertDto } from './admin.types'
import type { OrderDto } from '@/domains/orders/orders.types'
import type { OrderStatus } from '@/domains/orders/orders.types'
import type { ProductDto, ProductDetailDto } from '@/domains/products/products.types'
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
}

export interface CreateCategoryRequest {
  name: string
  description?: string
  parentId?: number
  displayOrder?: number
  isActive?: boolean
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

export const adminApi = {
  // --- Dashboard ---
  getStats: async (): Promise<DashboardStatsDto> => {
    const { data } = await apiClient.get('/api/admin/stats')
    return data
  },

  getLowStock: async (): Promise<LowStockAlertDto[]> => {
    const { data } = await apiClient.get('/api/admin/products/low-stock')
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
    const { data } = await apiClient.patch(`/api/admin/orders/${id}/status`, { status })
    return data
  },

  // --- Products ---
  getProducts: async (page = 0, size = 20, keyword?: string): Promise<PagedProducts> => {
    const { data } = await apiClient.get('/api/admin/products', {
      params: { page, size, ...(keyword ? { keyword } : {}) },
    })
    return data
  },

  getProduct: async (id: number): Promise<ProductDetailDto> => {
    const { data } = await apiClient.get(`/api/admin/products/${id}`)
    return data
  },

  createProduct: async (req: CreateProductRequest): Promise<ProductDetailDto> => {
    const { data } = await apiClient.post('/api/admin/products', req)
    return data
  },

  updateProduct: async (id: number, req: Partial<CreateProductRequest>): Promise<ProductDetailDto> => {
    const { data } = await apiClient.put(`/api/admin/products/${id}`, req)
    return data
  },

  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/products/${id}`)
  },

  // --- Image upload ---
  getUploadUrl: async (fileName: string, contentType: string): Promise<{ uploadUrl: string; fileKey: string }> => {
    const { data } = await apiClient.post('/api/assets/upload-url', { fileName, contentType })
    return data
  },

  addProductImage: async (productId: number, url: string, isPrimary = false): Promise<void> => {
    await apiClient.post(`/api/products/${productId}/images`, { url, isPrimary })
  },

  deleteProductImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.delete(`/api/products/${productId}/images/${imageId}`)
  },

  setPrimaryImage: async (productId: number, imageId: number): Promise<void> => {
    await apiClient.put(`/api/products/${productId}/images/${imageId}/primary`)
  },

  // --- Categories ---
  createCategory: async (req: CreateCategoryRequest): Promise<CategoryDto> => {
    const { data } = await apiClient.post('/api/admin/categories', req)
    return data
  },

  updateCategory: async (id: number, req: Partial<CreateCategoryRequest>): Promise<CategoryDto> => {
    const { data } = await apiClient.put(`/api/admin/categories/${id}`, req)
    return data
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${id}`)
  },

  // --- Reviews ---
  getReviews: async (page = 0, size = 20, approved?: boolean): Promise<PagedReviewsAdmin> => {
    const { data } = await apiClient.get('/api/admin/reviews', {
      params: { page, size, ...(approved !== undefined ? { approved } : {}) },
    })
    return data
  },

  approveReview: async (id: number): Promise<ReviewDto> => {
    const { data } = await apiClient.put(`/api/admin/reviews/${id}/approve`)
    return data
  },

  deleteReview: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/reviews/${id}`)
  },

  respondToReview: async (id: number, response: string): Promise<ReviewDto> => {
    const { data } = await apiClient.put(`/api/admin/reviews/${id}/response`, { response })
    return data
  },

  // --- Coupons ---
  getCoupons: async (page = 0, size = 20): Promise<PagedCoupons> => {
    const { data } = await apiClient.get('/api/admin/coupons', { params: { page, size } })
    return data
  },

  createCoupon: async (req: CreateCouponRequest): Promise<CouponDto> => {
    const { data } = await apiClient.post('/api/admin/coupons', req)
    return data
  },

  updateCoupon: async (id: number, req: Partial<CreateCouponRequest>): Promise<CouponDto> => {
    const { data } = await apiClient.put(`/api/admin/coupons/${id}`, req)
    return data
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/coupons/${id}`)
  },
}
