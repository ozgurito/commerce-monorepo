'use client'
import Link from 'next/link'
import { Heart, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { UserMenu } from './UserMenu'

export function HeaderActions() {
  const { itemCount, openDrawer } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const { openAuthModal } = useUIStore()

  const iconBtn = `flex flex-col items-center gap-[3px] px-1.5 sm:px-3 py-[7px] text-white/85
                   text-[11px] font-semibold rounded-xl hover:bg-white/10
                   transition-colors cursor-pointer flex-shrink-0`

  return (
    /* ml-auto pushes this group to the far right regardless of search bar width */
    <div className="flex items-center gap-0.5 ml-auto flex-shrink-0">

      {/* Favoriler */}
      {isAuthenticated ? (
        <Link href="/hesabim/favorilerim" className={iconBtn}>
          <Heart size={23} strokeWidth={1.8} />
          <span className="hidden sm:block">Favorilerim</span>
        </Link>
      ) : (
        <button onClick={() => openAuthModal('login')} className={iconBtn}>
          <Heart size={23} strokeWidth={1.8} />
          <span className="hidden sm:block">Favorilerim</span>
        </button>
      )}

      {/* Sepet */}
      <button onClick={openDrawer} className={`${iconBtn} relative`}>
        <div className="relative">
          <ShoppingCart size={23} strokeWidth={1.8} />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-orange text-white text-[9px]
                             font-extrabold min-w-[17px] h-[17px] rounded-full
                             flex items-center justify-center px-1
                             border-[1.5px] border-navy leading-none">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
        <span className="hidden sm:block">Sepetim</span>
      </button>

      {/* Kullanıcı / Giriş Yap */}
      <UserMenu />
    </div>
  )
}
