export interface ProductDto {
  id: number
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  stock: number
  sku: string
  active: boolean
  featured: boolean
  categoryId: number
  categoryName: string
  imageUrl: string
  averageRating: number
  totalReviews: number
  fitType: string | null
  fabricComposition: string | null
  careInstructions: string | null
  modelInfo: string | null
  sizeGuide: string | null
  material: string | null
  season: string | null
  originCountry: string | null
  gender: string | null
  ageGroup: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductImageDto {
  id: number
  productId: number
  imageUrl: string       // NOT "url"
  altText: string | null
  displayOrder: number   // NOT "sortOrder"
  isPrimary: boolean
}

export interface ProductVariantDto {
  id: number
  name: string
  variantType: string | null
  size: string | null
  color: string | null   // NOT "colorName"
  colorHex: string | null
  sku: string | null
  priceModifier: number
  stock: number
  isActive: boolean
}

export interface ProductDetailDto {
  id: number
  name: string
  slug: string
  description: string
  shortDescription: string | null
  price: number
  comparePrice: number | null
  stock: number
  sku: string
  isActive: boolean      // NOT "active"
  isFeatured: boolean    // NOT "featured"
  allowReviews: boolean
  categoryId: number
  categoryName: string
  imageUrl: string | null
  images: ProductImageDto[]
  variants: ProductVariantDto[]
  averageRating: number
  totalReviews: number
  fitType: string | null
  fabricComposition: string | null
  careInstructions: string | null
  modelInfo: string | null
  sizeGuide: string | null
  material: string | null
  season: string | null
  originCountry: string | null
  gender: string | null
  ageGroup: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductSearchRequest {
  keyword?: string
  categoryId?: number
  categoryIds?: number[]
  includeSubcategories?: boolean
  minPrice?: number
  maxPrice?: number
  colors?: string[]
  sizes?: string[]
  inStockOnly?: boolean
  featuredOnly?: boolean
  featured?: boolean
  gender?: string
  season?: string
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
  page?: number
  size?: number
}

export interface PagedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
  first: boolean
  last: boolean
}
