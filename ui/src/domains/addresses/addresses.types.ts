export type AddressType = 'SHIPPING' | 'BILLING' | 'BOTH'

export interface UserAddressDto {
  id: number
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  neighborhood: string | null
  addressLine: string
  postalCode: string | null
  isDefault: boolean
  addressType: AddressType
  formattedAddress: string
}

export interface UserAddressRequest {
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  neighborhood?: string
  addressLine: string
  postalCode?: string
  isDefault?: boolean
  addressType?: AddressType
}
