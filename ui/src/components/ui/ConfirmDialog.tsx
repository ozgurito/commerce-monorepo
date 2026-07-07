'use client'
import { AlertTriangle } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Onayla', cancelLabel = 'Vazgeç',
  danger = false, loading = false, onConfirm, onCancel,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[380px] p-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4
                        ${danger ? 'bg-red-50' : 'bg-orange/10'}`}>
          <AlertTriangle size={22} className={danger ? 'text-red-500' : 'text-orange'} />
        </div>
        <h2 className="text-lg font-extrabold text-navy-dark mb-2">{title}</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5
                       rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 font-bold py-2.5 rounded-xl transition-colors text-white
                       disabled:opacity-60
                       ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-orange hover:bg-orange-dark'}`}
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
