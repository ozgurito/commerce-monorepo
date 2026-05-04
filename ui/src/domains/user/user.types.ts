export interface UserDto {
  id: number
  email: string
  fullName: string | null
  phone: string | null
  identityNumber: string | null
  role: string
  isActive: boolean
  emailVerified: boolean
  lastLoginAt: string | null
  createdAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  identityNumber?: string
}
