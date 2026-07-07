'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { AccountSidebar } from '@/components/layout/AccountSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header/Header'
import { CategoryNav } from '@/components/layout/CategoryNav/CategoryNav'
import { Footer } from '@/components/layout/Footer/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartSync } from '@/components/cart/CartSync'

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
    <>
      <TopBar />
      <Header />
      <CategoryNav />

      <main className="flex-1 bg-gray-50/60">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-14 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <AccountSidebar />
            {/* items-start ile mobilde (flex-col) bu kutu otomatik genişlemiyor —
                w-full ile zorluyoruz, md:w-auto ile masaüstünde flex-1 davranışına geri dönüyor */}
            <div className="flex-1 min-w-0 w-full md:w-auto">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
      <CartDrawer />
      <CartSync />
    </>
  )
}
