import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { EmailDogrulaContent } from './EmailDogrulaContent'

export const metadata: Metadata = {
  title: 'E-posta Doğrulama',
  robots: { index: false },
}

export default function EmailDogrulaPage() {
  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="text-orange animate-spin" />
          </div>
        }>
          <EmailDogrulaContent />
        </Suspense>
      </div>
    </div>
  )
}
