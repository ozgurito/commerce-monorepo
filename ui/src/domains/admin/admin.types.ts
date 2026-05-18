export interface DashboardStatsDto {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  completedOrders: number
  totalProducts: number
  activeProducts: number
  lowStockProducts: number
  totalUsers: number
  totalReviews: number
  pendingReviews: number
  totalRevenue: number
  averageOrderValue: number
}

export interface LowStockAlertDto {
  productId: number
  productName: string
  sku: string
  currentStock: number
}

export interface MonthlyStatDto {
  year: number
  month: number
  orderCount: number
  revenue: number
}
