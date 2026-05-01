import type { Metadata } from 'next'
import { HeroSlider } from '@/components/home/HeroSlider'
import { PromoStrip } from '@/components/home/PromoStrip'
import { CategoryBubbles } from '@/components/home/CategoryBubbles'
import { FlashDeal } from '@/components/home/FlashDeal'
import { PromoBanners } from '@/components/home/PromoBanners'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'

export const metadata: Metadata = {
  title: 'AlışverişNoktan — Türkiye\'nin Giyim Mağazası',
  description: 'En yeni moda ve giyim ürünleri. Binlerce ürün, hızlı kargo, güvenli ödeme. T-Shirt, Hoodie, Sweatshirt ve daha fazlası.',
  openGraph: {
    title: 'AlışverişNoktan — Türkiye\'nin Giyim Mağazası',
    description: 'En yeni moda ve giyim ürünleri.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Trust strip */}
      <PromoStrip />

      {/* 3. Categories */}
      <div className="max-w-[1280px] mx-auto px-5 pt-8">
        <CategoryBubbles />
      </div>

      {/* 4. Flash deals */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <FlashDeal />
      </div>

      {/* 5. Featured products grid */}
      <div className="bg-gray-50">
        <FeaturedProducts />
      </div>

      {/* 6. Promo banners */}
      <div className="bg-white">
        <PromoBanners />
      </div>

      {/* Spacer */}
      <div className="h-8" />
    </div>
  )
}
