import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Hesabım', template: '%s | Hesabım' },
  robots: { index: false, follow: false },
}

export default function HesabimLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
