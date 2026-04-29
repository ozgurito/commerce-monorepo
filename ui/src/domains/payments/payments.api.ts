import apiClient from '@/lib/api-client'
import type {
  IyzicoCheckoutInitRequest,
  IyzicoCheckoutInitResponse,
  BankTransferInitRequest,
  BankTransferInitResponse,
  CodConfirmRequest,
} from './payments.types'
import type { OrderDto } from '@/domains/orders/orders.types'

export const paymentsApi = {
  iyzicoInit: async (req: IyzicoCheckoutInitRequest): Promise<IyzicoCheckoutInitResponse> => {
    const { data } = await apiClient.post('/api/payments/iyzico/init', req)
    return data
  },

  bankTransferInit: async (req: BankTransferInitRequest): Promise<BankTransferInitResponse> => {
    const { data } = await apiClient.post('/api/payments/bank-transfer/init', req)
    return data
  },

  codConfirm: async (req: CodConfirmRequest): Promise<OrderDto> => {
    const { data } = await apiClient.post('/api/payments/cod/confirm', req)
    return data
  },
}
