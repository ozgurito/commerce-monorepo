export interface UserDto {
  id: number
  email: string
  fullName: string
  phone: string | null
  identityNumber: string | null
  role: string
  createdAt: string
}

export interface UpdateProfileRequest {
  fullName?: string
  phone?: string
  identityNumber?: string
}
