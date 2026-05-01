'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { User, ShoppingBag, Heart, LogOut, ChevronDown, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useUIStore } from '@/store/ui.store'
import { useClickOutside } from '@/hooks/useClickOutside'
import { authApi } from '@/domains/auth/auth.api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function UserMenu() {
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore()
  const { openAuthModal } = useUIStore()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    setOpen(false)
    toast.success('Çıkış yapıldı')
    router.push('/')
  }

  const firstName = user?.fullName?.split(' ')[0] ?? 'Hesabım'

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => openAuthModal('login')}
        className="flex flex-col items-center gap-[3px] px-3 py-[7px] text-white/85
                   text-[11px] font-semibold rounded-xl hover:bg-white/10
                   transition-colors flex-shrink-0"
      >
        <User size={23} strokeWidth={1.8} />
        <span>Giriş Yap</span>
      </button>
    )
  }

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex flex-col items-center gap-[3px] px-3 py-[7px] text-white/85
                   text-[11px] font-semibold rounded-xl hover:bg-white/10
                   transition-colors"
      >
        {/* Avatar circle with initial */}
        <div className="relative">
          <div className="w-[23px] h-[23px] rounded-full bg-orange flex items-center justify-center
                          text-white text-[10px] font-extrabold">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <ChevronDown
            size={10}
            className={`absolute -bottom-0.5 -right-1 text-white/70 transition-transform
                        ${open ? 'rotate-180' : ''}`}
          />
        </div>
        <span className="max-w-[70px] truncate">{firstName}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[220px] bg-white rounded-2xl
                        shadow-[0_8px_40px_rgba(0,0,0,.15)] border border-gray-100
                        py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-extrabold text-navy-dark truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
          </div>

          <div className="py-1">
            <Link href="/hesabim" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-orange-50 hover:text-orange transition-colors group">
              <User size={15} className="text-gray-400 group-hover:text-orange" />
              Profilim
            </Link>
            <Link href="/hesabim/siparislerim" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-orange-50 hover:text-orange transition-colors group">
              <ShoppingBag size={15} className="text-gray-400 group-hover:text-orange" />
              Siparişlerim
            </Link>
            <Link href="/hesabim/favorilerim" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                         hover:bg-orange-50 hover:text-orange transition-colors group">
              <Heart size={15} className="text-gray-400 group-hover:text-orange" />
              Favorilerim
            </Link>

            {isAdmin && (
              <>
                <div className="border-t border-gray-100 mx-3 my-1" />
                <Link href="/admin" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold
                             text-navy hover:bg-navy-50 transition-colors group">
                  <Settings size={15} className="text-navy group-hover:text-orange" />
                  Admin Panel
                </Link>
              </>
            )}
          </div>

          <div className="border-t border-gray-100 pt-1 pb-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                         text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
