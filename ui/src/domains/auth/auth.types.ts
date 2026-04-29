export interface AuthRequest {
  email: string
  password: string
  fullName?: string
}

// Backend: AuthResponse record — field adı "token" (access_token değil)
export interface AuthResponse {
  token: string | null
  refreshToken: string | null
  userId: number
  email: string
  fullName: string
  role: string
}

// Backend: RefreshTokenResponse record
export interface RefreshTokenResponse {
  token: string
  refreshToken: string
  role: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}
