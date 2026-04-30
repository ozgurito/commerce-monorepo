'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/giris')
    else if (!isAdmin) router.replace('/')
  }, [isAuthenticated, isAdmin, router])

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">{children}</main>
    </div>
  )
}
