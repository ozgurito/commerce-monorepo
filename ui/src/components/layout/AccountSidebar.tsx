'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/domains/auth/auth.api'

const NAV_ITEMS = [
  { href: '/hesabim',            label: 'Profilim',       icon: User },
  { href: '/hesabim/siparislerim', label: 'Siparişlerim',  icon: Package },
  { href: '/hesabim/favorilerim',  label: 'Favorilerim',   icon: Heart },
  { href: '/hesabim/adreslerim',   label: 'Adreslerim',    icon: MapPin },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Sessizce devam et
    }
    logout()
    toast.success('Çıkış yapıldı')
    router.push('/')
  }

  return (
    <aside className="w-64 flex-shrink-0">
      {/* Kullanıcı bilgisi */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange/10 flex items-center justify-center
                          text-orange font-extrabold text-lg">
            {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-navy-dark truncate">{user?.fullName ?? 'Kullanıcı'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigasyon */}
      <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-3.5 text-sm font-semibold
                          border-b border-gray-50 last:border-0 transition-colors
                          ${isActive
                            ? 'bg-orange/5 text-orange border-l-2 border-l-orange'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-navy-dark'}`}
            >
              <Icon size={16} className={isActive ? 'text-orange' : 'text-gray-400'} />
              {label}
            </Link>
          )
        })}

        {/* Çıkış */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-semibold
                     text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
        >
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </nav>
    </aside>
  )
}
