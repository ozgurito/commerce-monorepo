'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { AccountSidebar } from '@/components/layout/AccountSidebar'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/giris')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="max-w-[1280px] mx-auto px-5 py-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
        <AccountSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
