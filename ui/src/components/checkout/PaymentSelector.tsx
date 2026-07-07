'use client'
import { CreditCard, Building2 } from 'lucide-react'
import type { PaymentMethod } from '@/domains/orders/orders.types'

const OPTIONS: {
  value: PaymentMethod
  label: string
  desc: string
  Icon: React.ElementType
  badge?: string
}[] = [
  {
    value: 'CREDIT_CARD',
    label: 'Kredi / Banka Kartı',
    desc: 'PayTR güvencesiyle güvenli ödeme',
    Icon: CreditCard,
    badge: 'Önerilen',
  },
  {
    value: 'BANK_TRANSFER',
    label: 'Havale / EFT',
    desc: 'Banka hesabımıza transfer yapın, sipariş onaylansın',
    Icon: Building2,
  },
]

interface Props {
  selected: PaymentMethod
  onChange: (method: PaymentMethod) => void
  onConfirm: () => void
  isLoading?: boolean
}

export function PaymentSelector({ selected, onChange, onConfirm, isLoading }: Props) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {OPTIONS.map(({ value, label, desc, Icon, badge }) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-colors
                        ${selected === value
                          ? 'border-orange bg-orange-light'
                          : 'border-gray-200 hover:border-gray-300'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                              ${selected === value ? 'bg-orange text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-dark">{label}</p>
                  {badge && (
                    <span className="text-[10px] font-bold bg-orange text-white px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0
                              ${selected === value
                                ? 'border-orange bg-orange'
                                : 'border-gray-300'}`}
              >
                {selected === value && (
                  <div className="w-full h-full rounded-full bg-white scale-[0.4]" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full bg-orange hover:bg-orange-dark text-white font-bold py-3.5
                   rounded-xl transition-colors disabled:opacity-60"
      >
        {isLoading ? 'Sipariş Oluşturuluyor…' : 'Siparişi Onayla'}
      </button>
    </div>
  )
}
