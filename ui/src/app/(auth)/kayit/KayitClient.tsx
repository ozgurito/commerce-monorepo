'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth.store'
import { RegisterForm } from '@/components/auth/RegisterForm'

export function KayitClient() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) router.replace('/hesabim')
  }, [isAuthenticated, router])

  return (
    <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,.08)] border border-gray-100 p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-navy-dark">Üye Ol</h1>
        <p className="text-sm text-gray-500 mt-1">
          Hızlıca hesap oluşturun ve alışverişe başlayın
        </p>
      </div>

      <RegisterForm
        onSuccess={() => router.push('/hesabim')}
        onSwitchToLogin={() => router.push('/giris')}
      />

      <div className="mt-6 pt-6 border-t border-gray-100 text-center">
        <p className="text-sm text-gray-500">
          Zaten hesabınız var mı?{' '}
          <Link href="/giris" className="text-orange font-bold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  )
}
