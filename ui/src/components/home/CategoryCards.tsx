import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

const CATEGORY_CARDS = [
  {
    slug: 'tshirt',
    eyebrow: 'T-Shirt',
    title: 'Rahat &\nŞık Tişört',
    desc: 'Oversized\'dan slim fite her tarz',
    cta: 'Keşfet',
    href: '/kategori/tshirt',
    image: '/images/categories/tshirt-vitrin.webp',
    imageAlt: 'Tişört koleksiyonu',
    imagePos: 'object-center object-top',
    overlay: 'from-[#1a2a3a]/80 via-[#1a2a3a]/40 to-[#1a2a3a]/05',
  },
  {
    slug: 'sweatshirt',
    eyebrow: 'Sweatshirt',
    title: 'Renkli\nSweatshirt',
    desc: 'Her renk her mevsim',
    cta: 'Gör',
    href: '/kategori/sweatshirt',
    image: '/images/categories/sweatshirt-vitrin.webp',
    imageAlt: 'Sweatshirt koleksiyonu',
    imagePos: 'object-center',
    overlay: 'from-[#0a1a0a]/80 via-[#0a1a0a]/40 to-[#0a1a0a]/05',
  },
  {
    slug: 'esofman',
    eyebrow: 'Eşofman',
    title: 'Spor &\nRahatlık',
    desc: 'Evde veya sporda şıklık',
    cta: 'Alışveriş',
    href: '/kategori/esofman',
    image: '/images/categories/esofman-vitrin.webp',
    imageAlt: 'Eşofman koleksiyonu',
    imagePos: 'object-center',
    overlay: 'from-[#2a0a1a]/75 via-[#2a0a1a]/35 to-[#2a0a1a]/05',
  },
]

export function CategoryCards() {
  return (
    <section className="py-6">
      <div className="max-w-[1280px] mx-auto px-5">
        {/* Başlık — "Kategoriler" değil, ürüne odaklı */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold text-navy-dark">Ürünlerimiz</h2>
            <p className="text-xs text-gray-400 mt-0.5">Kategoriye göre hızlı erişim</p>
          </div>
          <Link
            href="/urunler"
            className="text-sm font-semibold text-orange hover:text-orange/80 transition-colors
                       flex items-center gap-1 group"
          >
            Tüm ürünler <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 3 kart — mobilde 1, desktopta 3'lü */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CATEGORY_CARDS.map((card) => (
            <Link
              key={card.slug}
              href={card.href}
              className="relative overflow-hidden rounded-2xl h-[220px] sm:h-[280px]
                         flex flex-col justify-between p-5
                         group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Full-bleed arka plan */}
              <div className="absolute inset-0">
                <Image
                  src={card.image}
                  alt={card.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className={`object-cover ${card.imagePos} transition-transform duration-500 group-hover:scale-105`}
                />
                {/* Soldan koyu overlay — metin okunabilir */}
                <div className={`absolute inset-0 bg-gradient-to-r ${card.overlay}`} />
                {/* Alt vignette */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Üst: kategori etiketi */}
              <div className="relative">
                <span className="text-[10px] font-extrabold text-white/90 uppercase tracking-widest
                                 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                  {card.eyebrow}
                </span>
              </div>

              {/* Alt: başlık + CTA */}
              <div className="relative">
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight
                               whitespace-pre-line drop-shadow-lg mb-1.5">
                  {card.title}
                </h3>
                <p className="text-[11px] text-white/60 mb-3 leading-snug">{card.desc}</p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-white
                                bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-white/25
                                group-hover:bg-white/30 group-hover:gap-2.5 transition-all duration-200">
                  {card.cta} <ArrowRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
