'use client'
import dynamic from 'next/dynamic'
import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header/Header'
import { CategoryNav } from '@/components/layout/CategoryNav/CategoryNav'
import { Footer } from '@/components/layout/Footer/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartSync } from '@/components/cart/CartSync'
import { useUIStore } from '@/store/ui.store'

// Ağır modal — dinamik import ile yükle
const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal').then((m) => ({ default: m.AuthModal })),
  { ssr: false }
)

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { authModalOpen, authModalTab, closeAuthModal } = useUIStore()

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
      <CartDrawer />
      <CartSync />

      {/* Auth modal — global, header'daki "Giriş Yap" tetikler */}
      {authModalOpen && (
        <AuthModal
          defaultTab={authModalTab}
          onClose={closeAuthModal}
        />
      )}
    </>
  )
}
