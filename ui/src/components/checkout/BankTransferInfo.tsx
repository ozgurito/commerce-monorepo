'use client'
import { useState } from 'react'
import { Copy, Check, Clock, Building2 } from 'lucide-react'
import { formatPrice } from '@/utils/format'
import type { BankTransferInitResponse } from '@/domains/payments/payments.types'

interface Props {
  info: BankTransferInitResponse
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-navy-dark font-mono break-all">{value}</span>
        <button
          onClick={handleCopy}
          className={`flex-shrink-0 flex items-center gap-1 text-xs font-semibold px-2 py-1
                      rounded-lg transition-colors
                      ${copied ? 'bg-green-100 text-green-600' : 'bg-white border border-gray-200 text-gray-500 hover:text-orange hover:border-orange'}`}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Kopyalandı' : 'Kopyala'}
        </button>
      </div>
    </div>
  )
}

export function BankTransferInfo({ info }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <Building2 size={20} className="text-blue-600 flex-shrink-0" />
        <div>
          <p className="text-sm font-bold text-blue-800">{info.bankName}</p>
          <p className="text-xs text-blue-600">Hesap Sahibi: {info.accountHolder}</p>
        </div>
      </div>

      <CopyField label="IBAN" value={info.iban} />
      <CopyField label="Açıklama (zorunlu)" value={info.description} />

      <div className="bg-orange-light border border-orange/20 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Transfer tutarı</span>
          <span className="font-extrabold text-navy-dark text-base">{formatPrice(info.amount)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-orange font-semibold">
          <Clock size={12} />
          {info.deadlineHours} saat içinde transfer yapılmalıdır
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">{info.message}</p>
    </div>
  )
}
