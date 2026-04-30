'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { LoginForm } from '@/components/auth/LoginForm'

export function GirisClient() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) router.replace('/hesabim')
  }, [isAuthenticated, router])

  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-orange">
            Alışveriş<span className="text-navy-dark">Noktan</span>
          </Link>
          <h1 className="text-xl font-extrabold text-navy-dark mt-4">Giriş Yap</h1>
          <p className="text-sm text-gray-500 mt-1">Hesabınıza giriş yapın</p>
        </div>

        <LoginForm
          onSuccess={() => router.push('/hesabim')}
          onSwitchToRegister={() => router.push('/kayit')}
        />

        <p className="text-center text-sm text-gray-500 mt-6">
          Hesabınız yok mu?{' '}
          <Link href="/kayit" className="text-orange font-bold hover:underline">
            Üye Ol
          </Link>
        </p>
      </div>
    </div>
  )
}
