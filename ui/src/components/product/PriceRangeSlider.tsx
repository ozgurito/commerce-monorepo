'use client'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

interface Props {
  initialMin?: number
  initialMax?: number
  onChange: (min: number | undefined, max: number | undefined) => void
}

export function PriceRangeSlider({ initialMin, initialMax, onChange }: Props) {
  const [localMin, setLocalMin] = useState(initialMin?.toString() ?? '')
  const [localMax, setLocalMax] = useState(initialMax?.toString() ?? '')

  const debouncedMin = useDebounce(localMin, 400)
  const debouncedMax = useDebounce(localMax, 400)

  useEffect(() => {
    const minVal = debouncedMin ? Number(debouncedMin) : undefined
    const maxVal = debouncedMax ? Number(debouncedMax) : undefined
    onChange(minVal, maxVal)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMin, debouncedMax])

  return (
    <div>
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Fiyat Aralığı</p>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min ₺"
          value={localMin}
          onChange={(e) => setLocalMin(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
          min={0}
        />
        <span className="text-gray-400 text-sm flex-shrink-0">—</span>
        <input
          type="number"
          placeholder="Max ₺"
          value={localMax}
          onChange={(e) => setLocalMax(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
          min={0}
        />
      </div>
    </div>
  )
}
