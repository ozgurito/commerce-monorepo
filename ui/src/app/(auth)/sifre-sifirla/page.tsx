import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { SifreSifirlaContent } from './SifreSifirlaContent'

export const metadata: Metadata = {
  title: 'Şifre Sıfırla',
  robots: { index: false },
}

export default function SifreSifirlaPage() {
  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <Loader2 size={28} className="text-orange animate-spin" />
          </div>
        }>
          <SifreSifirlaContent />
        </Suspense>
      </div>
    </div>
  )
}
