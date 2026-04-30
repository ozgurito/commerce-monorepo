import type { Metadata } from 'next'
import { HeroSlider } from '@/components/home/HeroSlider'
import { PromoStrip } from '@/components/home/PromoStrip'
import { FlashDeal } from '@/components/home/FlashDeal'
import { CategoryBubbles } from '@/components/home/CategoryBubbles'
import { PromoBanners } from '@/components/home/PromoBanners'

export const metadata: Metadata = {
  title: 'AlışverişNoktan — Türkiye\'nin Giyim Mağazası',
  description: 'En yeni moda ve giyim ürünleri. Binlerce ürün, hızlı kargo, güvenli ödeme.',
  openGraph: {
    title: 'AlışverişNoktan',
    description: 'En yeni moda ve giyim ürünleri.',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <PromoStrip />
      <div className="max-w-[1280px] mx-auto px-5 py-10 space-y-14">
        <CategoryBubbles />
        <FlashDeal />
        <PromoBanners />
      </div>
    </div>
  )
}
