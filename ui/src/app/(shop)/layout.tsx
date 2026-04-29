import { TopBar } from '@/components/layout/TopBar'
import { Header } from '@/components/layout/Header/Header'
import { CategoryNav } from '@/components/layout/CategoryNav/CategoryNav'
import { Footer } from '@/components/layout/Footer/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartSync } from '@/components/cart/CartSync'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <CategoryNav />
      <main className="flex-1 bg-gray-50">{children}</main>
      <Footer />
      <CartDrawer />
      <CartSync />
    </>
  )
}
