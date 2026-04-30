import type { Metadata } from 'next'
import { GirisClient } from './GirisClient'

export const metadata: Metadata = {
  title: 'Giriş Yap',
  description: 'AlışverişNoktan hesabınıza giriş yapın.',
  robots: { index: false },
}

export default function GirisPage() {
  return <GirisClient />
}
