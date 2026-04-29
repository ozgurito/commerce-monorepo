'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Plus, Check } from 'lucide-react'
import { addressesApi } from '@/domains/addresses/addresses.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { AddressForm } from './AddressForm'
import type { Address } from '@/domains/orders/orders.types'
import type { UserAddressDto } from '@/domains/addresses/addresses.types'

interface Props {
  onSelect: (address: Address) => void
  isLoading?: boolean
}

function savedToAddress(a: UserAddressDto): Address {
  return {
    fullName:    a.fullName,
    phone:       a.phone,
    city:        a.city,
    district:    a.district,
    addressLine: a.addressLine,
    postalCode:  a.postalCode ?? '',
    country:     'Türkiye',
  }
}

export function AddressPicker({ onSelect, isLoading }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const { data: addresses = [], isLoading: loadingAddresses } = useQuery({
    queryKey: QUERY_KEYS.addresses.all,
    queryFn: addressesApi.getAll,
    staleTime: 5 * 60 * 1000,
  })

  const handleSelectSaved = (addr: UserAddressDto) => {
    setSelectedId(addr.id)
    setShowForm(false)
  }

  const handleConfirm = () => {
    const addr = addresses.find((a: UserAddressDto) => a.id === selectedId)
    if (addr) onSelect(savedToAddress(addr))
  }

  if (loadingAddresses) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Kayıtlı adresler */}
      {addresses.length > 0 && !showForm && (
        <>
          <div className="space-y-3">
            {addresses.map((addr: UserAddressDto) => (
              <button
                key={addr.id}
                onClick={() => handleSelectSaved(addr)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-colors
                            ${selectedId === addr.id
                              ? 'border-orange bg-orange-light'
                              : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={15} className="text-orange flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-navy-dark">{addr.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{addr.fullName} · {addr.phone}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{addr.formattedAddress}</p>
                    </div>
                  </div>
                  {selectedId === addr.id && (
                    <Check size={16} className="text-orange flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedId && (
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full bg-orange hover:bg-orange-dark text-white font-bold
                         py-3.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {isLoading ? 'Devam ediliyor…' : 'Bu Adresi Kullan'}
            </button>
          )}

          <button
            onClick={() => { setSelectedId(null); setShowForm(true) }}
            className="flex items-center gap-2 text-sm font-semibold text-orange hover:underline"
          >
            <Plus size={14} />
            Yeni Adres Ekle
          </button>
        </>
      )}

      {/* Kayıtlı adres yok veya form açık */}
      {(addresses.length === 0 || showForm) && (
        <>
          {addresses.length > 0 && showForm && (
            <button
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-navy-dark transition-colors"
            >
              ← Kayıtlı adreslerime dön
            </button>
          )}
          <AddressForm
            onSubmit={onSelect}
            isLoading={isLoading}
            submitLabel="Bu Adresi Kullan"
          />
        </>
      )}
    </div>
  )
}
