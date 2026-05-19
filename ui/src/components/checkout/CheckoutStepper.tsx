import { Check } from 'lucide-react'

const STEPS = ['Adres', 'Ödeme Yöntemi', 'Sipariş Özeti']

interface Props {
  current: number // 0-indexed
}

export function CheckoutStepper({ current }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((label, i) => {
        const done = i < current
        const active = i === current

        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                            transition-colors
                            ${done
                              ? 'bg-green-500 text-white'
                              : active
                                ? 'bg-orange text-white'
                                : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span
                className={`hidden sm:block mt-1.5 text-[11px] font-semibold whitespace-nowrap
                            ${active ? 'text-orange' : done ? 'text-green-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div
                className={`w-8 sm:w-16 md:w-24 h-0.5 mb-5 mx-1
                            ${i < current ? 'bg-green-400' : 'bg-gray-200'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
