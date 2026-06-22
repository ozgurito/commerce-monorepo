import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Basın & Medya | AlışverişNoktan',
  description: 'AlışverişNoktan basın kiti, medya görselleri ve iletişim bilgileri.',
}

export default function BasinPage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">Basın & Medya</h1>
      <p className="text-gray-500 mb-10">Medya ve basın mensupları için kurumsal bilgiler</p>

      {/* Hakkımızda Özet */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">AlışverişNoktan Hakkında</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          AlışverişNoktan, 2023 yılında İstanbul'da kurulan, Türkiye'nin büyüyen dijital giyim perakende
          platformlarından biridir. T-shirt, sweatshirt, hoodie, eşofman ve tank top kategorilerinde
          güncel koleksiyonlar sunan marka; hız, kalite ve müşteri memnuniyetini öncelik olarak benimsemektedir.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Tüm ürünlerimiz sertifikalı tedarikçilerden temin edilmekte; 14 gün iade garantisi ve ücretsiz
          kargo seçenekleriyle müşterilerimize güvenli alışveriş deneyimi sunulmaktadır.
        </p>
      </section>

      {/* Temel Rakamlar */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">Temel Rakamlar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { num: '500+', label: 'Aktif Ürün' },
            { num: '10K+', label: 'Mutlu Müşteri' },
            { num: '14 gün', label: 'İade Garantisi' },
            { num: '1–3 gün', label: 'Teslimat Süresi' },
          ].map(({ num, label }) => (
            <div key={label} className="bg-gray-50 rounded-2xl p-5 text-center">
              <p className="text-2xl font-extrabold text-orange mb-1">{num}</p>
              <p className="text-sm text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Basın İletişim */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">Basın İletişim</h2>
        <div className="bg-navy-dark rounded-2xl p-6 text-white">
          <p className="font-semibold mb-1">Medya & Halkla İlişkiler</p>
          <p className="text-white/70 text-sm mb-4">
            Röportaj talepleri, basın kiti ve görsel istekleri için aşağıdaki adrese ulaşabilirsiniz.
          </p>
          <a
            href="mailto:basin@alisverisnoktan.com"
            className="inline-flex items-center gap-2 bg-orange text-white font-bold px-5 py-2.5
                       rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            basin@alisverisnoktan.com
          </a>
        </div>
      </section>

      {/* Logo & Görseller */}
      <section>
        <h2 className="text-xl font-bold text-navy-dark mb-4">Logo & Marka Görselleri</h2>
        <p className="text-gray-600 text-sm mb-4">
          Basın materyallerimize erişmek için medya iletişim adresimize başvurun.
          Logolar, ürün görselleri ve şirket fotoğrafları talep üzerine yüksek çözünürlüklü
          formatta iletilmektedir.
        </p>
        <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
          <p className="text-4xl mb-3">📁</p>
          <p className="font-semibold">Basın Kiti</p>
          <p className="text-sm mt-1">Talep için basin@alisverisnoktan.com adresine yazın</p>
        </div>
      </section>
    </div>
  )
}
