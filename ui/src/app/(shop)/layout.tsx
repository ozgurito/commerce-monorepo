'use client'
import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header/Header'
import { CategoryNav } from '@/components/layout/CategoryNav/CategoryNav'
import { Footer } from '@/components/layout/Footer/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartSync } from '@/components/cart/CartSync'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'
import { useUIStore } from '@/store/ui.store'

// Ağır modal — dinamik import ile yükle
const AuthModal = dynamic(
  () => import('@/components/auth/AuthModal').then((m) => ({ default: m.AuthModal })),
  { ssr: false }
)

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  const { authModalOpen, authModalTab, closeAuthModal } = useUIStore()
  const pathname = usePathname()

  // Ürün detay sayfasında MobileBottomNav gizli (kendi sabit sepet barı var, bkz. ProductInfo),
  // o yüzden nav için ayrılan pb-16 boşluğu burada gereksiz — footer'dan önce büyük boşluk bırakıyordu.
  const isProductDetail = /^\/urunler\/[^/]+\/?$/.test(pathname)

  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav />
      <main className={`flex-1 bg-gray-50 ${isProductDetail ? '' : 'pb-16 md:pb-0'}`}>{children}</main>
      <Footer />
      <CartDrawer />
      <CartSync />
      <MobileBottomNav />

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
