import type { Metadata } from 'next'
import { HeroSlider } from '@/components/home/HeroSlider'
import { PromoStrip } from '@/components/home/PromoStrip'
import { CategoryBubbles } from '@/components/home/CategoryBubbles'
import { FlashDeal } from '@/components/home/FlashDeal'
import { PromoBanners } from '@/components/home/PromoBanners'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection'
import { SaleBannerStrip } from '@/components/home/SaleBannerStrip'
import { CategoryCards } from '@/components/home/CategoryCards'

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
      <CategoryBubbles />

      {/* 4. Flash deals */}
      <div className="bg-gradient-to-b from-gray-50 to-white">
        <FlashDeal />
      </div>

      {/* 5. Featured products grid */}
      <div className="bg-gray-50">
        <FeaturedProducts />
      </div>

      {/* 6. İndirim + Güven bandı */}
      <div className="bg-gray-50">
        <SaleBannerStrip />
      </div>

      {/* 7. Kategori kartları (T-Shirt, Hoodie, Sweatshirt, Tank Top) */}
      <div className="bg-white">
        <CategoryCards />
      </div>

      {/* 8. Promo banners (Kadın, Erkek, Flaş Fırsat) */}
      <div className="bg-gray-50">
        <PromoBanners />
      </div>

      {/* 9. Yeni Gelenler */}
      <NewArrivalsSection />

      {/* Spacer */}
      <div className="h-8" />
    </div>
  )
}
