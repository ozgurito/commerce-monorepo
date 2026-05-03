'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { LoginForm } from '@/components/auth/LoginForm'

export function GirisClient() {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) router.replace(isAdmin ? '/admin' : '/hesabim')
  }, [isAuthenticated, isAdmin, router])

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,.08)] border border-gray-100 p-8">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-navy-dark">Giriş Yap</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hesabınıza giriş yaparak alışverişe devam edin
        </p>
      </div>

      <LoginForm
        onSuccess={() => router.push(isAdmin ? '/admin' : '/hesabim')}
        onSwitchToRegister={() => router.push('/kayit')}
      />

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="text-orange font-bold hover:underline">
            Ücretsiz Üye Ol
          </Link>
        </p>
      </div>
    </div>
  )
}
