'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, ChevronDown, ChevronUp } from 'lucide-react'
import { useCookieConsentStore } from '@/store/cookie-consent.store'

const TOGGLES: { key: 'analytics' | 'functional' | 'marketing'; label: string; desc: string }[] = [
  { key: 'analytics',  label: 'Analitik Çerezler',    desc: 'Siteyi nasıl kullandığınızı anlamamıza yardımcı olur.' },
  { key: 'functional', label: 'Fonksiyonel Çerezler', desc: 'Dil ve görüntüleme tercihlerinizi hatırlar.' },
  { key: 'marketing',  label: 'Pazarlama Çerezleri',  desc: 'İlgi alanlarınıza uygun reklamlar göstermek için kullanılır.' },
]

export function CookieConsentBanner() {
  const { hasResponded, analytics, functional, marketing, acceptAll, acceptNecessaryOnly, setPreferences } =
    useCookieConsentStore()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState({ analytics, functional, marketing })

  // Hydration uyuşmazlığını önle — persist edilen değer client'ta yüklenene kadar bekle
  useEffect(() => { setMounted(true) }, [])

  if (!mounted || hasResponded) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-[500] bg-white border-t border-gray-200
                    shadow-[0_-8px_30px_rgba(0,0,0,.12)]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-[1280px] mx-auto px-5 py-4 sm:py-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
            <Cookie size={18} className="text-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-navy-dark mb-1">Çerez Tercihleri</p>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Sitenin çalışması için zorunlu çerezleri her zaman kullanırız. Analiz ve pazarlama
              çerezleri için onayınızı istiyoruz.{' '}
              <Link href="/cerez" className="text-orange hover:underline font-medium whitespace-nowrap">
                Çerez Politikası
              </Link>
            </p>

            {expanded && (
              <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-700">Zorunlu Çerezler</p>
                    <p className="text-[11px] text-gray-400">Devre dışı bırakılamaz — sitenin çalışması için gerekli.</p>
                  </div>
                  <div className="w-10 h-6 rounded-full bg-gray-200 flex items-center px-0.5 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm ml-auto" />
                  </div>
                </div>
                {TOGGLES.map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-gray-700">{label}</p>
                      <p className="text-[11px] text-gray-400">{desc}</p>
                    </div>
                    <button
                      onClick={() => setDraft((d) => ({ ...d, [key]: !d[key] }))}
                      className={`w-10 h-6 rounded-full flex items-center px-0.5 flex-shrink-0
                                 transition-colors ${draft[key] ? 'bg-orange' : 'bg-gray-200'}`}
                      aria-label={label}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform
                                       ${draft[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center flex-wrap gap-2 mt-4">
              {expanded ? (
                <button
                  onClick={() => setPreferences(draft)}
                  className="px-4 py-2 bg-orange hover:bg-orange-dark text-white text-xs font-bold
                             rounded-xl transition-colors"
                >
                  Tercihleri Kaydet
                </button>
              ) : (
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 bg-orange hover:bg-orange-dark text-white text-xs font-bold
                             rounded-xl transition-colors"
                >
                  Tümünü Kabul Et
                </button>
              )}
              <button
                onClick={acceptNecessaryOnly}
                className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold
                           rounded-xl hover:bg-gray-50 transition-colors"
              >
                Sadece Zorunlu Çerezler
              </button>
              <button
                onClick={() => setExpanded((e) => !e)}
                className="flex items-center gap-1 px-3 py-2 text-gray-500 text-xs font-semibold
                           hover:text-navy-dark transition-colors"
              >
                {expanded ? 'Gizle' : 'Tercihleri Yönet'}
                {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
