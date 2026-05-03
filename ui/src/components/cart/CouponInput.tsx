'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Tag, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cartApi } from '@/domains/cart/cart.api'
import { QUERY_KEYS } from '@/lib/query-keys'
import { formatPrice } from '@/utils/format'

interface Props {
  appliedCoupon: string | null
  discountAmount: number | null
  onApplied: (code: string, discountAmount: number) => void
  onRemoved: () => void
}

export function CouponInput({ appliedCoupon, discountAmount, onApplied, onRemoved }: Props) {
  const [code, setCode] = useState('')
  const queryClient = useQueryClient()

  const applyMutation = useMutation({
    mutationFn: () => cartApi.applyCoupon(code.trim().toUpperCase()),
    onSuccess: (res: { couponCode: string; discountAmount: number }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      onApplied(res.couponCode ?? code.trim().toUpperCase(), Number(res.discountAmount ?? 0))
      setCode('')
      toast.success('Kupon uygulandı!')
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Geçersiz kupon kodu')
    },
  })

  const removeMutation = useMutation({
    mutationFn: () => cartApi.removeCoupon(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart.all })
      onRemoved()
      toast.success('Kupon kaldırıldı')
    },
  })

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200
                      rounded-xl px-3 py-2.5">
        <div className="flex items-center gap-2 text-green-700">
          <Tag size={14} />
          <span className="text-sm font-bold">{appliedCoupon}</span>
          {discountAmount != null && discountAmount > 0 ? (
            <span className="text-xs font-semibold">-{formatPrice(discountAmount)}</span>
          ) : (
            <span className="text-xs">uygulandı</span>
          )}
        </div>
        <button
          onClick={() => removeMutation.mutate()}
          disabled={removeMutation.isPending}
          className="text-green-500 hover:text-red-500 transition-colors disabled:opacity-40"
          aria-label="Kuponu kaldır"
        >
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && code.trim() && applyMutation.mutate()}
        placeholder="Kupon kodu"
        className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                   focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange
                   uppercase placeholder:normal-case"
        maxLength={20}
      />
      <button
        onClick={() => applyMutation.mutate()}
        disabled={!code.trim() || applyMutation.isPending}
        className="px-4 py-2.5 bg-navy-dark text-white text-sm font-bold rounded-xl
                   hover:bg-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-1.5"
      >
        {applyMutation.isPending
          ? <Loader2 size={14} className="animate-spin" />
          : <Tag size={14} />}
        Uygula
      </button>
    </div>
  )
}
