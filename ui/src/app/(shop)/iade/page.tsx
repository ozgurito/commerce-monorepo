import type { Metadata } from 'next'
import { RotateCcw, CheckCircle, Clock, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'İade & Değişim | AlışverişNoktan',
  description: '30 gün iade garantisi. Kolay ve ücretsiz iade süreci.',
}

export default function IadePage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">İade & Değişim</h1>
      <p className="text-gray-500 mb-10">30 gün içinde koşulsuz iade garantisi</p>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-navy-dark to-navy rounded-2xl p-6 mb-10 text-white flex items-center gap-4">
        <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center flex-shrink-0">
          <RotateCcw size={24} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-lg">30 Gün Koşulsuz İade</p>
          <p className="text-white/70 text-sm mt-0.5">
            Ürünü beğenmezseniz, hiçbir soru sormadan iade alıyoruz.
          </p>
        </div>
      </div>

      {/* İade Koşulları */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">İade Koşulları</h2>
        <div className="space-y-3">
          {[
            'Ürün teslim tarihinden itibaren 30 gün içinde iade talebinde bulunulmalıdır.',
            'İade edilecek ürün kullanılmamış, yıkanmamış ve orijinal etiketleri üzerinde olmalıdır.',
            'Ürün, orijinal ambalajı (varsa) ile birlikte iade edilmelidir.',
            'İç giyim ve mayo gibi hijyen ürünleri iade kapsamı dışındadır.',
            'Kargo hasarından kaynaklanan iade taleplerinde fotoğraflı belge gerekmektedir.',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Adım Adım İade */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-5">İade Nasıl Yapılır?</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Müşteri Hizmetlerine Ulaşın', desc: 'Telefon veya e-posta ile iade talebinizi bildirin. İade kodu oluşturulacaktır.' },
            { step: '2', title: 'Ürünü Paketleyin', desc: 'Ürünü orijinal veya sağlam bir kutuya koyun. İade kodunuzu paketin üzerine yazın.' },
            { step: '3', title: 'Kargoya Verin', desc: 'Anlaşmalı kargo firmamız üzerinden kargoya teslim edin. Kargo ücreti tarafımızca karşılanır.' },
            { step: '4', title: 'Para İadenizi Alın', desc: 'Ürün bize ulaştıktan 3–5 iş günü içinde ödeme yönteminize iade yapılır.' },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-9 h-9 bg-orange text-white font-extrabold rounded-xl
                              flex items-center justify-center flex-shrink-0 text-sm">
                {step}
              </div>
              <div className="pb-4 border-b border-gray-100 flex-1 last:border-0">
                <p className="font-bold text-gray-800 text-sm mb-1">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* İade Süreleri */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-navy-dark mb-4">Para İadesi Süreleri</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { method: 'Kredi Kartı', time: '3–5 iş günü', icon: '💳' },
            { method: 'Havale/EFT', time: '1–3 iş günü', icon: '🏦' },
            { method: 'Kapıda Ödeme', time: '3–5 iş günü (IBAN)', icon: '🚪' },
          ].map(({ method, time, icon }) => (
            <div key={method} className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">{icon}</p>
              <p className="font-bold text-gray-800 text-sm">{method}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <Clock size={11} /> {time}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* İletişim CTA */}
      <section className="bg-orange/5 border border-orange/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1">
          <p className="font-bold text-gray-800">İade talebi oluşturmak mı istiyorsunuz?</p>
          <p className="text-sm text-gray-500 mt-1">Müşteri hizmetlerimiz 09:00–21:00 arası hizmetinizdedir.</p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <a
            href="tel:+905418771635"
            className="flex items-center gap-2 bg-navy-dark text-white font-bold
                       px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
          >
            <Phone size={14} />
            0541 877 16 35
          </a>
          <a
            href="mailto:iade@alisverisnoktan.com"
            className="flex items-center gap-2 bg-orange text-white font-bold
                       px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors text-sm"
          >
            E-Posta
          </a>
        </div>
      </section>
    </div>
  )
}
