'use client'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

type Tab = 'login' | 'register'

interface Props {
  defaultTab?: Tab
  onClose: () => void
  onSuccess?: () => void
}

export function AuthModal({ defaultTab = 'login', onClose, onSuccess }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab)

  // ESC tuşuyla kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Scroll kilitle
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSuccess = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] mx-4 p-6">
        {/* Kapat butonu */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600
                     w-8 h-8 flex items-center justify-center rounded-lg
                     hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Logo / Başlık */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-navy-dark">
            {tab === 'login' ? 'Giriş Yap' : 'Üye Ol'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">AlışverişNoktan</p>
        </div>

        {/* Sekmeler */}
        <div className="flex border border-gray-200 rounded-xl p-1 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors
              ${tab === 'login'
                ? 'bg-orange text-white'
                : 'text-gray-500 hover:text-navy-dark'}`}
          >
            Giriş Yap
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors
              ${tab === 'register'
                ? 'bg-orange text-white'
                : 'text-gray-500 hover:text-navy-dark'}`}
          >
            Üye Ol
          </button>
        </div>

        {/* Form */}
        {tab === 'login' ? (
          <LoginForm
            onSuccess={handleSuccess}
            onSwitchToRegister={() => setTab('register')}
          />
        ) : (
          <RegisterForm
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setTab('login')}
          />
        )}
      </div>
    </div>
  )
}
