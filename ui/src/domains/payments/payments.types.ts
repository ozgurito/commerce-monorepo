// IyzicoCheckoutInitRequest — sadece orderId (tüm sipariş bilgisi değil)
export interface IyzicoCheckoutInitRequest {
  orderId: number
  callbackUrl?: string
}

export interface IyzicoCheckoutInitResponse {
  token: string
  paymentPageUrl: string
  conversationId: string
  orderNumber: string
  basketId: string
  expiresAt: string
}

// BankTransferInitRequest — sadece orderId
export interface BankTransferInitRequest {
  orderId: number
}

export interface BankTransferInitResponse {
  orderId: number
  orderNumber: string
  amount: number
  iban: string
  accountHolder: string
  bankName: string
  description: string
  deadlineHours: string
  message: string
}

// CodConfirmRequest — sadece orderId
export interface CodConfirmRequest {
  orderId: number
}
