import type { Metadata } from 'next'
import { KayitClient } from './KayitClient'

export const metadata: Metadata = {
  title: 'Üye Ol',
  description: 'AlışverişNoktan\'a üye olun. Hızlı kayıt, kolay alışveriş.',
  robots: { index: false },
}

export default function KayitPage() {
  return <KayitClient />
}
