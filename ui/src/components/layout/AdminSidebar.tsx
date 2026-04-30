'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Tag, Star, Ticket, LogOut,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import { authApi } from '@/domains/auth/auth.api'

const NAV_ITEMS = [
  { href: '/admin',            label: 'Dashboard',   icon: LayoutDashboard, exact: true },
  { href: '/admin/urunler',    label: 'Ürünler',     icon: Package },
  { href: '/admin/siparisler', label: 'Siparişler',  icon: ShoppingBag },
  { href: '/admin/kategoriler',label: 'Kategoriler', icon: Tag },
  { href: '/admin/yorumlar',   label: 'Yorumlar',    icon: Star },
  { href: '/admin/kuponlar',   label: 'Kuponlar',    icon: Ticket },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    try { await authApi.logout() } catch { /* ignore */ }
    logout()
    toast.success('Çıkış yapıldı')
    router.push('/')
  }

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="w-56 bg-navy-dark min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Link href="/admin" className="text-white font-extrabold text-lg leading-tight">
          Alışveriş<span className="text-orange">Noktan</span>
          <span className="block text-xs font-normal text-white/40 mt-0.5">Admin Panel</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                          transition-colors
                          ${active
                            ? 'bg-orange text-white'
                            : 'text-white/60 hover:text-white hover:bg-white/10'}`}
            >
              <Icon size={16} className={active ? 'text-white' : 'text-white/40'} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Mağazaya Git + Çıkış */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2.5 text-xs text-white/50
                     hover:text-white transition-colors rounded-lg"
        >
          ← Mağazaya Git
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold
                     text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={15} /> Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
