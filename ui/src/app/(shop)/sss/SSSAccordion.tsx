'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SSSItem {
  q: string
  a: string
}

export function SSSAccordion({ items }: { items: SSSItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left
                       hover:bg-gray-50 transition-colors"
          >
            <span className="font-semibold text-navy-dark text-sm">{item.q}</span>
            <ChevronDown
              size={16}
              className={`text-orange flex-shrink-0 transition-transform duration-200
                          ${open === i ? 'rotate-180' : ''}`}
            />
          </button>

          {open === i && (
            <div className="px-5 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
