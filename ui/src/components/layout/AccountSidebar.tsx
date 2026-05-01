'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, Package, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/domains/auth/auth.api'

const NAV_ITEMS = [
  { href: '/hesabim',                label: 'Profilim',     icon: User    },
  { href: '/hesabim/siparislerim',   label: 'Siparişlerim', icon: Package },
  { href: '/hesabim/favorilerim',    label: 'Favorilerim',  icon: Heart   },
  { href: '/hesabim/adreslerim',     label: 'Adreslerim',   icon: MapPin  },
]

export function AccountSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    toast.success('Çıkış yapıldı')
    router.push('/')
  }

  const isActive = (href: string) =>
    href === '/hesabim' ? pathname === '/hesabim' : pathname.startsWith(href)

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <aside className="w-full md:w-[230px] flex-shrink-0">

      {/* ── Mobile pill nav ── */}
      <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-none pb-3 mb-4
                      border-b border-gray-100">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                          whitespace-nowrap flex-shrink-0 transition-all
                          ${active
                            ? 'bg-orange text-white shadow-md shadow-orange/25'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-orange hover:text-orange'}`}
            >
              <Icon size={13} />
              {label}
            </Link>
          )
        })}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold
                     whitespace-nowrap flex-shrink-0 bg-white border border-gray-200
                     text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
        >
          <LogOut size={13} />
          Çıkış
        </button>
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden md:block">

        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange to-orange-dark
                            flex items-center justify-center font-extrabold text-white text-lg
                            flex-shrink-0 shadow-md shadow-orange/30">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-navy-dark text-sm truncate">
                {user?.fullName ?? 'Üye'}
              </p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3.5 text-sm font-semibold
                            border-b border-gray-50 last:border-0 transition-all
                            ${active
                              ? 'bg-orange-50 text-orange border-l-[3px] border-l-orange'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-navy-dark'}`}
              >
                <Icon size={16} className={active ? 'text-orange' : 'text-gray-400'} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={14} className="text-orange/50" />}
              </Link>
            )
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold
                       text-red-500 hover:bg-red-50 transition-colors border-t border-gray-100"
          >
            <LogOut size={16} />
            <span>Çıkış Yap</span>
          </button>
        </nav>
      </div>
    </aside>
  )
}
