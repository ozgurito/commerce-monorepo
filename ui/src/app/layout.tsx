import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { WhatsAppButton } from '@/components/ui/WhatsAppButton'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: { default: 'AlışverişNoktan', template: '%s | AlışverişNoktan' },
  description: 'Türkiye\'nin giyim mağazası',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
        <WhatsAppButton />
      </body>
    </html>
  )
}
