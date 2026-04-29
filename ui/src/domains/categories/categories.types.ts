export interface CategoryDto {
  id: number
  name: string
  slug: string
  description: string | null
  parentId: number | null
  imageUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export interface CategoryPathDto {
  id: number
  name: string
  slug: string
}
