import type { Metadata } from 'next'
import { Package, Truck, MapPin, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kargo Takip | AlışverişNoktan',
  description: 'Siparişinizin kargo durumunu takip edin.',
}

export default function KargoTakipPage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">Kargo Takip</h1>
      <p className="text-gray-500 mb-10">Siparişinizin nerede olduğunu öğrenin</p>

      {/* Takip Formu (görünüm) */}
      <section className="mb-10">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-navy-dark mb-4">Sipariş Takibi</h2>
          <p className="text-sm text-gray-600 mb-5">
            Siparişlerim sayfasından siparişinizin kargo takip numarasına ulaşabilirsiniz.
            Kargo takip numaranızı öğrendikten sonra aşağıdaki kargo firması sitelerinden
            takip edebilirsiniz.
          </p>
          <a
            href="/hesabim/siparislerim"
            className="inline-flex items-center gap-2 bg-orange text-white font-bold
                       px-6 py-3 rounded-xl hover:bg-orange-600 transition-colors"
          >
            <Package size={16} />
            Siparişlerime Git
          </a>
        </div>
      </section>

      {/* Kargo Firmaları */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">Çalıştığımız Kargo Firmaları</h2>
        <div className="space-y-3">
          {[
            {
              name: 'Yurtiçi Kargo',
              url: 'https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula',
              desc: 'Takip numaranızla anlık konum sorgulayın',
              color: 'bg-red-50 border-red-100',
            },
            {
              name: 'Aras Kargo',
              url: 'https://www.araskargo.com.tr/gonderi-sorgulama.aspx',
              desc: 'Takip numaranızla gönderi sorgulayın',
              color: 'bg-yellow-50 border-yellow-100',
            },
            {
              name: 'MNG Kargo',
              url: 'https://www.mngkargo.com.tr/wps/portal/mng/gonderitakip',
              desc: 'Takip numaranızla kargo durumunu öğrenin',
              color: 'bg-blue-50 border-blue-100',
            },
          ].map(({ name, url, desc, color }) => (
            <a
              key={name}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-between p-4 rounded-xl border ${color}
                         hover:shadow-sm transition-shadow group`}
            >
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-gray-400 group-hover:text-orange transition-colors" />
                <div>
                  <p className="font-bold text-gray-800 text-sm">{name}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <span className="text-xs text-orange font-semibold">Takip Et →</span>
            </a>
          ))}
        </div>
      </section>

      {/* Teslimat Bilgileri */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">Teslimat Bilgileri</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: Truck, title: 'Standart Kargo', desc: '1–3 iş günü içinde teslim' },
            { icon: Package, title: 'Ücretsiz Kargo', desc: '150 TL ve üzeri siparişlerde' },
            { icon: MapPin, title: 'Teslimat Bölgesi', desc: 'Türkiye geneli tüm iller' },
            { icon: Phone, title: 'Kargo Desteği', desc: '0541 877 16 35' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 bg-orange/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-orange" />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SSS */}
      <section>
        <h2 className="text-xl font-bold text-navy-dark mb-4">Sık Sorulan Sorular</h2>
        <div className="space-y-3">
          {[
            { q: 'Kargom ne zaman gelecek?', a: 'Siparişiniz onaylandıktan sonra 1–3 iş günü içinde teslim edilir.' },
            { q: 'Kargo ücretini nasıl öğrenirim?', a: '150 TL ve üzeri siparişlerde kargo ücretsizdir. Altında kalan siparişler için 29,90 TL kargo ücreti uygulanır.' },
            { q: 'Kargom kaybolursa ne yapmalıyım?', a: 'Müşteri hizmetlerimizi arayın: 0541 877 16 35. 24 saat içinde dönüş sağlarız.' },
          ].map(({ q, a }) => (
            <div key={q} className="border border-gray-100 rounded-xl p-4">
              <p className="font-semibold text-gray-800 text-sm mb-1.5">{q}</p>
              <p className="text-sm text-gray-600">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
