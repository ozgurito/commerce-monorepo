'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { User, ShoppingBag, Heart, LogOut, ChevronDown, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useClickOutside } from '@/hooks/useClickOutside'
import { authApi } from '@/domains/auth/auth.api'

export function UserMenu() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    setOpen(false)
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => openAuthModal('login')}
        className="h-[40px] px-[18px] bg-orange text-white rounded-[9px] text-[13px] font-bold
                   flex items-center gap-[6px] hover:bg-orange-dark transition-all hover:-translate-y-px
                   whitespace-nowrap"
      >
        <User size={15} />
        Giriş Yap
      </button>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex flex-col items-center gap-[3px] px-[10px] py-[7px] text-white/85
                   text-[11px] font-semibold rounded-[10px] hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center gap-1">
          <User size={22} />
          <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
        <span className="max-w-[80px] truncate">{user?.fullName?.split(' ')[0] ?? 'Hesabım'}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[200px] bg-white rounded-xl shadow-hover
                        border border-gray-100 py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>

          <Link href="/hesabim" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <User size={15} className="text-gray-400" /> Profilim
          </Link>
          <Link href="/hesabim/siparislerim" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <ShoppingBag size={15} className="text-gray-400" /> Siparişlerim
          </Link>
          <Link href="/hesabim/favorilerim" onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            <Heart size={15} className="text-gray-400" /> Favorilerim
          </Link>

          {isAdmin && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <Link href="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy font-semibold hover:bg-navy-50 transition-colors">
                <Settings size={15} /> Admin Panel
              </Link>
            </>
          )}

          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      )}
    </div>
  )
}
