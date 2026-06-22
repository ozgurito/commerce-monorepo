import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Star, Truck, Shield, Heart, Package } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hakkımızda | AlışverişNoktan',
  description:
    'AlışverişNoktan olarak 2020\'den bu yana kaliteli giyim ürünlerini uygun fiyatlarla Türkiye\'nin dört bir yanına ulaştırıyoruz.',
}

const STATS = [
  { value: '50.000+', label: 'Mutlu Müşteri' },
  { value: '500+',    label: 'Ürün Çeşidi' },
  { value: '4.8',     label: 'Ortalama Puan' },
  { value: '81 İl',   label: 'Teslimat' },
]

const VALUES = [
  {
    icon: Star,
    title: 'Kalite Odaklı',
    desc: 'Her ürünü titizlikle seçiyor; yalnızca kaliteli kumaş ve üretim standartlarını karşılayan markaları listeliyoruz.',
  },
  {
    icon: Truck,
    title: 'Hızlı Teslimat',
    desc: '1000₺ ve üzeri siparişlerde ücretsiz kargo. Siparişiniz ortalama 1–3 iş günü içinde kapınıza teslim.',
  },
  {
    icon: Shield,
    title: 'Güvenli Alışveriş',
    desc: '256-bit SSL şifreleme ve lisanslı ödeme altyapısıyla kişisel ve finansal verileriniz her zaman güvende.',
  },
  {
    icon: Heart,
    title: 'Müşteri Önce',
    desc: '14 gün koşulsuz iade garantisi ve 7/24 destek ekibimizle alışverişin her adımında yanınızdayız.',
  },
]

const TIMELINE = [
  { year: '2020', text: 'AlışverişNoktan, İstanbul\'da küçük bir ekiple kuruldu.' },
  { year: '2021', text: 'İlk 10.000 siparişimize ulaştık; kategorilerimizi genişlettik.' },
  { year: '2022', text: 'Mobil uygulamamızı yayına aldık ve 81 ile teslimat ağı kurduk.' },
  { year: '2024', text: '50.000 mutlu müşteriyle Türkiye\'nin güvenilir giyim adresi olduk.' },
]

export default function HakkimizdaPage() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden py-12 px-4 sm:px-6 lg:px-10 xl:px-14 min-h-[280px]">
        <Image 
          src="/images/headers/about-header.webp" 
          alt="Hakkımızda" 
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
            <span className="text-white font-semibold">Hakkımızda</span>
          </nav>
          <h1 className="text-4xl font-extrabold text-white mb-3 drop-shadow-lg">Hakkımızda</h1>
          <p className="text-white/80 text-sm max-w-xl drop-shadow">
            2020'den bu yana kaliteli giyimi herkesin erişebileceği fiyatlarla sunuyoruz.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-16">

        {/* Hikayemiz + İstatistikler */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-extrabold text-navy-dark">Hikayemiz</h2>
            <p className="text-gray-600 leading-relaxed">
              AlışverişNoktan, "kaliteli giyim pahalı olmak zorunda değil" inancıyla 2020 yılında kuruldu.
              Tişört'ten sweatshirt'e, kapüşonludan tank top'a geniş ürün yelpazemizle her mevsim
              ve her tarza uygun seçenekler sunuyoruz.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Tedarikçilerimizi titizlikle seçiyor, her ürünün kalite standartlarını bizzat denetliyoruz.
              Amacımız; sezon trendlerini takip ederek müşterilerimizin her zaman doğru ürünü
              doğru fiyata bulmasını sağlamak.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-center"
              >
                <p className="text-2xl font-extrabold text-orange">{s.value}</p>
                <p className="text-xs text-gray-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Değerlerimiz */}
        <section>
          <h2 className="text-2xl font-extrabold text-navy-dark mb-8 text-center">Değerlerimiz</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3"
              >
                <div className="w-10 h-10 bg-orange/10 rounded-xl flex items-center justify-center">
                  <Icon size={20} className="text-orange" />
                </div>
                <h3 className="font-bold text-navy-dark text-sm">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tarihçe */}
        <section>
          <h2 className="text-2xl font-extrabold text-navy-dark mb-8">Yolculuğumuz</h2>
          <div className="relative space-y-0">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6">
                {/* Sol — yıl + çizgi */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-orange flex items-center justify-center
                                  text-white text-xs font-extrabold flex-shrink-0">
                    {item.year.slice(2)}
                  </div>
                  {i < TIMELINE.length - 1 && (
                    <div className="w-px flex-1 bg-gray-200 my-1" />
                  )}
                </div>
                {/* Sağ — içerik */}
                <div className="pb-8">
                  <p className="text-xs font-bold text-orange mb-1">{item.year}</p>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-navy-dark to-navy rounded-2xl p-8 text-center">
          <h2 className="text-xl font-extrabold text-white mb-2">Alışverişe Başlayın</h2>
          <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto">
            Yüzlerce ürün arasından size en uygun olanı bulun, hızlı ve güvenle sipariş verin.
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark
                       text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
          >
            <Package size={16} />
            Tüm Ürünleri Gör
          </Link>
        </section>

      </div>
    </div>
  )
}
