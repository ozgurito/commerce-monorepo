'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, User, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'

export function MobileBottomNav() {
  const pathname  = usePathname()
  const { itemCount, openDrawer } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const { openAuthModal } = useUIStore()

  // Admin sayfalarında gösterme
  if (pathname.startsWith('/admin')) return null
  // Auth sayfalarında da gizle
  if (pathname.startsWith('/giris') || pathname.startsWith('/kayit')) return null

  const isHome     = pathname === '/'
  const isSearch   = pathname.startsWith('/urunler') || pathname.startsWith('/arama') || pathname.startsWith('/kategori')
  const isFavorite = pathname.startsWith('/hesabim/favorilerim')
  const isAccount  = pathname.startsWith('/hesabim')

  const base = `flex flex-col items-center justify-center gap-[3px] flex-1 py-2
                text-[10px] font-semibold transition-colors select-none`
  const active   = 'text-orange'
  const inactive = 'text-gray-500'

  return (
    /* Sadece mobilde görünür (md ve üzeri gizle) */
    <nav className="fixed bottom-0 left-0 right-0 z-[400] md:hidden
                    bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,.08)]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-stretch h-14">

        {/* Ana Sayfa */}
        <Link href="/" className={`${base} ${isHome ? active : inactive}`}>
          <Home size={22} strokeWidth={isHome ? 2.5 : 1.8} />
          <span>Ana Sayfa</span>
        </Link>

        {/* Ara / Ürünler */}
        <Link href="/urunler" className={`${base} ${isSearch ? active : inactive}`}>
          <Search size={22} strokeWidth={isSearch ? 2.5 : 1.8} />
          <span>Ara</span>
        </Link>

        {/* Sepet — orta, vurgulu */}
        <button
          onClick={openDrawer}
          className={`${base} relative ${itemCount > 0 ? active : inactive}`}
        >
          <div className="relative">
            <ShoppingCart size={22} strokeWidth={itemCount > 0 ? 2.5 : 1.8} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange text-white
                               text-[9px] font-extrabold min-w-[16px] h-4 rounded-full
                               flex items-center justify-center px-0.5 leading-none
                               border border-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </div>
          <span>Sepetim</span>
        </button>

        {/* Favorilerim */}
        {isAuthenticated ? (
          <Link href="/hesabim/favorilerim" className={`${base} ${isFavorite ? active : inactive}`}>
            <Heart size={22} strokeWidth={isFavorite ? 2.5 : 1.8}
                   className={isFavorite ? 'fill-orange' : ''} />
            <span>Favoriler</span>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className={`${base} ${inactive}`}
          >
            <Heart size={22} strokeWidth={1.8} />
            <span>Favoriler</span>
          </button>
        )}

        {/* Hesabım */}
        {isAuthenticated ? (
          <Link href="/hesabim" className={`${base} ${isAccount && !isFavorite ? active : inactive}`}>
            <User size={22} strokeWidth={isAccount && !isFavorite ? 2.5 : 1.8} />
            <span>Hesabım</span>
          </Link>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className={`${base} ${inactive}`}
          >
            <User size={22} strokeWidth={1.8} />
            <span>Giriş Yap</span>
          </button>
        )}

      </div>
    </nav>
  )
}
