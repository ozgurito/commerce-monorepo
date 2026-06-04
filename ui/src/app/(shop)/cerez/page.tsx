import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Çerez Politikası | AlışverişNoktan',
  description: 'AlışverişNoktan çerez politikası ve çerez yönetimi hakkında bilgi edinin.',
}

const COOKIE_TYPES = [
  {
    type: 'Zorunlu Çerezler',
    desc: 'Sitenin temel işlevleri için gereklidir (oturum yönetimi, sepet, güvenlik). Bu çerezler devre dışı bırakılamaz.',
    examples: 'session_id, csrf_token, cart_token',
    duration: 'Oturum süresi',
  },
  {
    type: 'Analitik Çerezler',
    desc: 'Siteyi nasıl kullandığınızı anlamamıza yardımcı olur. Veriler anonim toplanır.',
    examples: '_ga, _gid (Google Analytics)',
    duration: '2 yıla kadar',
  },
  {
    type: 'Fonksiyonel Çerezler',
    desc: 'Dil tercihi, görüntüleme ayarları gibi kişiselleştirme seçeneklerini hatırlar.',
    examples: 'lang, theme, last_visited',
    duration: '1 yıla kadar',
  },
  {
    type: 'Pazarlama Çerezleri',
    desc: 'İlgi alanlarınıza uygun reklamlar göstermek için kullanılır. Bu çerezler için onayınız alınır.',
    examples: '_fbp, _gcl_au',
    duration: '90 güne kadar',
  },
]

export default function CerezPage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">Çerez Politikası</h1>
      <p className="text-gray-400 text-sm mb-10">Son güncelleme: Ocak 2025</p>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-3">Çerez Nedir?</h2>
        <p className="text-gray-600 leading-relaxed">
          Çerezler, ziyaret ettiğiniz web siteleri tarafından tarayıcınıza yerleştirilen küçük metin
          dosyalarıdır. Oturumunuzu hatırlamamızı, tercihlerinizi kaydetmemizi ve site
          performansını iyileştirmemizi sağlarlar.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-6">Kullandığımız Çerez Türleri</h2>
        <div className="space-y-4">
          {COOKIE_TYPES.map(({ type, desc, examples, duration }) => (
            <div key={type} className="border border-gray-100 rounded-2xl p-5">
              <h3 className="font-bold text-navy-dark mb-1">{type}</h3>
              <p className="text-sm text-gray-600 mb-3">{desc}</p>
              <div className="flex flex-wrap gap-x-8 gap-y-1 text-xs text-gray-400">
                <span><span className="font-semibold text-gray-500">Örnekler:</span> {examples}</span>
                <span><span className="font-semibold text-gray-500">Süre:</span> {duration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-3">Çerezleri Nasıl Yönetebilirsiniz?</h2>
        <p className="text-gray-600 leading-relaxed">
          Tarayıcı ayarlarınızdan çerezleri silebilir veya belirli çerez türlerini engelleyebilirsiniz.
          Zorunlu çerezlerin engellenmesi siteyi kullanımınızı olumsuz etkileyebilir. Tarayıcı
          ayarları için Chrome, Firefox, Safari veya Edge yardım sayfalarını ziyaret edebilirsiniz.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy-dark mb-3">İletişim</h2>
        <p className="text-gray-600 leading-relaxed">
          Çerez politikamız hakkında sorularınız için{' '}
          <a href="mailto:gizlilik@alisverisnoktan.com" className="text-orange hover:underline font-medium">
            gizlilik@alisverisnoktan.com
          </a>{' '}
          adresine ulaşabilirsiniz.
        </p>
      </section>
    </div>
  )
}
