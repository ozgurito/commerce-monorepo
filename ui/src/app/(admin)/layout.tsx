'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isAdmin } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  // Wait for Zustand persist hydration before checking auth
  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isAuthenticated) router.replace('/giris')
    else if (!isAdmin) router.replace('/')
  }, [mounted, isAuthenticated, isAdmin, router])

  // Show nothing until localStorage is hydrated — prevents premature redirect
  if (!mounted) return null
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
