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

  return (
    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
      {/* Favoriler */}
      {isAuthenticated ? (
        <Link
          href="/hesabim/favorilerim"
          className="flex flex-col items-center gap-[3px] px-[10px] py-[7px] text-white/85
                     text-[11px] font-semibold rounded-[10px] hover:bg-white/10 transition-colors"
        >
          <Heart size={22} />
          <span>Favoriler</span>
        </Link>
      ) : (
        <button
          onClick={() => openAuthModal('login')}
          className="flex flex-col items-center gap-[3px] px-[10px] py-[7px] text-white/85
                     text-[11px] font-semibold rounded-[10px] hover:bg-white/10 transition-colors"
        >
          <Heart size={22} />
          <span>Favoriler</span>
        </button>
      )}

      {/* Sepet */}
      <button
        onClick={openDrawer}
        className="flex flex-col items-center gap-[3px] px-[10px] py-[7px] text-white/85
                   text-[11px] font-semibold rounded-[10px] hover:bg-white/10 transition-colors relative"
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1.5 bg-orange text-white text-[10px] font-extrabold
                             min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1
                             border-2 border-navy">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          )}
        </div>
        <span>Sepetim</span>
      </button>

      {/* Kullanıcı */}
      <UserMenu />
    </div>
  )
}
