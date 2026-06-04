import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'İletişim | AlışverişNoktan',
  description:
    'AlışverişNoktan müşteri desteğine ulaşın. Sipariş, iade, ürün ve ödeme konularında yardımcı olmaktan memnuniyet duyarız.',
}

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Telefon',
    value: '0541 877 16 35',
    href: 'tel:+905418771635',
    note: 'Pazartesi – Cumartesi, 09:00 – 18:00',
  },
  {
    icon: Mail,
    label: 'E-posta',
    value: 'destek@alisverisnoktan.com',
    href: 'mailto:destek@alisverisnoktan.com',
    note: 'En geç 24 saat içinde yanıt',
  },
  {
    icon: MessageCircle,
    label: 'Canlı Destek',
    value: 'WhatsApp ile yazın',
    href: 'https://wa.me/905418771635',
    note: 'Hızlı yanıt için tercih edin',
  },
  {
    icon: MapPin,
    label: 'Adres',
    value: 'İzmir, Türkiye',
    href: null,
    note: 'Merkez ofis (randevusuz kabul yapılmaz)',
  },
]

const WORKING_HOURS = [
  { day: 'Pazartesi – Cuma',  hours: '09:00 – 18:00' },
  { day: 'Cumartesi',         hours: '10:00 – 16:00' },
  { day: 'Pazar',             hours: 'Kapalı' },
]

export default function IletisimPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-10 xl:px-14 min-h-[280px]">
        <Image 
          src="/images/headers/contact-header.webp" 
          alt="İletişim" 
          fill 
          priority 
          className="object-cover object-center" 
          sizes="100vw" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        
        <div className="relative z-10">
          <nav className="flex items-center gap-1 text-xs text-white/70 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
            <ChevronRight size={12} />
            <span className="text-white font-semibold">İletişim</span>
          </nav>
          <h1 className="text-4xl font-extrabold text-white mb-3 drop-shadow-lg">İletişim</h1>
          <p className="text-white/80 text-sm max-w-xl drop-shadow">
            Size en hızlı şekilde yardımcı olmak için buradayız.
            Aşağıdaki formu doldurun veya doğrudan ulaşın.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="grid lg:grid-cols-5 gap-8 items-start">

          {/* Sol — Form */}
          <div className="lg:col-span-3">
            <ContactForm />
          </div>

          {/* Sağ — Bilgi */}
          <div className="lg:col-span-2 space-y-5">

            {/* İletişim kanalları */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <h2 className="font-extrabold text-navy-dark text-base">Bize Ulaşın</h2>
              {CONTACT_INFO.map(({ icon: Icon, label, value, href, note }) => (
                <div key={label} className="flex gap-3">
                  <div className="w-9 h-9 bg-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-orange" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-navy-dark hover:text-orange transition-colors"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-navy-dark">{value}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">{note}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Çalışma saatleri */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-orange" />
                <h2 className="font-extrabold text-navy-dark text-base">Çalışma Saatleri</h2>
              </div>
              <div className="space-y-2">
                {WORKING_HOURS.map(({ day, hours }) => (
                  <div key={day} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{day}</span>
                    <span
                      className={`font-semibold ${
                        hours === 'Kapalı' ? 'text-red-400' : 'text-navy-dark'
                      }`}
                    >
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* SSS yönlendirme */}
            <div className="bg-navy-50 rounded-2xl p-5 space-y-2">
              <p className="text-sm font-bold text-navy-dark">Hızlı cevap arıyor musunuz?</p>
              <p className="text-xs text-gray-500">
                Sık sorulan soruların cevaplarını SSS sayfamızda bulabilirsiniz.
              </p>
              <Link
                href="/sss"
                className="inline-flex items-center gap-1 text-xs font-bold text-orange
                           hover:text-orange-dark transition-colors"
              >
                SSS Sayfasına Git <ChevronRight size={12} />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
