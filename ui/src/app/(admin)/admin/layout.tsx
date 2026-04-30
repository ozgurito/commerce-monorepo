import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Admin Panel', template: '%s | Admin' },
  robots: { index: false, follow: false },
}

export default function AdminInnerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
