'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Mail, Phone, MapPin } from 'lucide-react'
import { Logo } from '../Header/Logo'

// Lucide yeni sürümünde sosyal medya ikonları kaldırıldı — inline SVG kullanıyoruz
const SocialIcons = {
  Instagram: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  Twitter: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Youtube: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
}

const SOCIALS = [
  { Icon: SocialIcons.Instagram, href: '#', label: 'Instagram' },
  { Icon: SocialIcons.Twitter,   href: '#', label: 'Twitter' },
  { Icon: SocialIcons.Facebook,  href: '#', label: 'Facebook' },
  { Icon: SocialIcons.Youtube,   href: '#', label: 'YouTube' },
]

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  'Kurumsal': [
    { label: 'Hakkımızda', href: '/hakkimizda' },
    { label: 'Basın', href: '/basin' },
    { label: 'İletişim', href: '/iletisim' },
  ],
  'Yardım': [
    { label: 'Sık Sorulan Sorular', href: '/sss' },
    { label: 'Kargo Takip', href: '/kargo-takip' },
    { label: 'İade & Değişim', href: '/iade' },
    { label: 'Beden Rehberi', href: '/beden-rehberi' },
  ],
  'Hesabım': [
    { label: 'Giriş Yap', href: '/giris' },
    { label: 'Kayıt Ol', href: '/kayit' },
    { label: 'Siparişlerim', href: '/hesabim/siparislerim' },
    { label: 'Favorilerim', href: '/hesabim/favorilerim' },
  ],
  'Yasal': [
    { label: 'Gizlilik Politikası', href: '/gizlilik' },
    { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' },
    { label: 'KVKK', href: '/kvkk' },
    { label: 'Çerez Politikası', href: '/cerez' },
  ],
}

function FooterAccordionColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-white/10 md:border-none">
      {/* Mobil: tıklanabilir başlık | Masaüstü: statik başlık */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 md:py-0 md:cursor-default md:pointer-events-none"
      >
        <h4 className="text-sm font-bold text-white">{title}</h4>
        <ChevronDown
          size={16}
          className={`text-white/50 transition-transform duration-200 md:hidden
                      ${open ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>

      {/* Link listesi — mobilde collapse, masaüstünde her zaman açık */}
      <ul
        className={`space-y-2 overflow-hidden transition-all duration-300
                    md:!max-h-none md:!opacity-100 md:mt-4
                    ${open ? 'max-h-60 opacity-100 pb-3' : 'max-h-0 opacity-0 md:opacity-100'}`}
      >
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/55 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function Footer() {
  return (
    <footer className="bg-navy-dark text-white mt-auto">
      <div className="max-w-[1280px] mx-auto px-5 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-0 md:gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2 pb-6 md:pb-0 border-b border-white/10 md:border-none mb-4 md:mb-0">
            <Logo />
            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-[280px]">
              Türkiye&apos;nin en sevilen giyim mağazası. Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Phone size={14} className="text-orange flex-shrink-0" />
                0541 877 16 35
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Mail size={14} className="text-orange flex-shrink-0" />
                destek@alisverisnoktam.com
              </div>
              <div className="flex items-start gap-2 text-sm text-white/60">
                <MapPin size={14} className="text-orange flex-shrink-0 mt-0.5" />
                İzmir, Türkiye
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {SOCIALS.map(({ Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center
                             text-white/70 hover:bg-orange hover:text-white transition-colors"
                >
                  <Icon />
                </Link>
              ))}
            </div>
          </div>

          {/* Link kolonları — mobilde accordion, masaüstünde statik */}
          <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-6">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <FooterAccordionColumn key={title} title={title} links={links} />
            ))}
          </div>
        </div>

        {/* Payment badges + copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center
                        justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} AlışverişNoktan. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-2">
            {['VISA', 'MC', 'TROY', 'İyzico'].map((pay) => (
              <span
                key={pay}
                className="h-7 px-3 bg-white/10 rounded text-[10px] font-bold text-white/60
                           flex items-center border border-white/10"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
