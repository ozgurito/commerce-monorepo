import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Tag, Zap } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    eyebrow: 'Kadın Giyim',
    title: 'Yeni Sezon\nKoleksiyonu',
    desc: 'Bahar\'ın en trend parçaları',
    cta: 'Alışverişe Başla',
    href: '/urunler?yeni=true',
    icon: Sparkles,
    image: '/images/cat-header-yeni-gelenler.png',
    imageAlt: 'Yeni sezon giyim koleksiyonu',
    imagePos: 'object-center object-top',
    overlay: 'from-[#6b0f38]/90 via-[#6b0f38]/65 to-[#6b0f38]/20',
  },
  {
    id: 2,
    eyebrow: 'Erkek Giyim',
    title: 'Stil & Konfor\nBir Arada',
    desc: 'Urban & Casual koleksiyonu',
    cta: 'Keşfet',
    href: '/urunler',
    icon: Zap,
    image: '/images/Gemini_Generated_Image_qlnnl6qlnnl6qlnn.png',
    imageAlt: 'Erkek giyim koleksiyonu',
    imagePos: 'object-center',
    overlay: 'from-[#0d1a40]/90 via-[#0d1a40]/65 to-[#0d1a40]/20',
  },
  {
    id: 3,
    eyebrow: 'Flaş Fırsat',
    title: '%50\'ye Varan\nİndirimler',
    desc: 'Stoklar tükenmeden kaçırmayın',
    cta: 'İndirimlere Git',
    href: '/urunler?indirim=true',
    icon: Tag,
    image: '/images/cat-header-indirim.png',
    imageAlt: 'İndirimli ürünler',
    imagePos: 'object-center',
    // Amber/kahve overlay
    overlay: 'from-[#5c2800]/90 via-[#5c2800]/65 to-[#5c2800]/20',
  },
]

export function PromoBanners() {
  return (
    <section className="py-6">
      <div className="max-w-[1280px] mx-auto px-5">

        {/* Başlık */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-navy-dark">Öne Çıkan Koleksiyonlar</h2>
            <p className="text-xs text-gray-400 mt-0.5">Sezonun en çok tercih edilenleri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BANNERS.map((banner) => {
            const Icon = banner.icon
            return (
              <Link
                key={banner.id}
                href={banner.href}
                className="relative overflow-hidden rounded-2xl h-[210px] sm:h-[230px]
                           flex flex-col justify-between p-5
                           group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* Full-bleed background image */}
                <div className="absolute inset-0">
                  <Image
                    src={banner.image}
                    alt={banner.imageAlt}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className={`object-cover ${banner.imagePos} transition-transform duration-500 group-hover:scale-105`}
                  />
                  {/* Left→Right gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${banner.overlay}`} />
                  {/* Alt vignette */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                {/* Top: icon + eyebrow */}
                <div className="relative flex items-center gap-2">
                  <div className="bg-white/20 backdrop-blur-sm w-8 h-8 rounded-xl
                                  flex items-center justify-center border border-white/30">
                    <Icon size={16} className="text-white" />
                  </div>
                  <span className="text-xs font-extrabold text-white/80 uppercase tracking-widest drop-shadow">
                    {banner.eyebrow}
                  </span>
                </div>

                {/* Middle: title */}
                <div className="relative">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight
                                 whitespace-pre-line drop-shadow-lg">
                    {banner.title}
                  </h3>
                  <p className="text-xs text-white/65 mt-1 drop-shadow">{banner.desc}</p>
                </div>

                {/* Bottom: CTA */}
                <div className="relative">
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-white
                                  bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/25
                                  group-hover:bg-white/30 group-hover:gap-3 transition-all duration-200">
                    {banner.cta}
                    <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
