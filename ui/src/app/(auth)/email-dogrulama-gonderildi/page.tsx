import type { Metadata } from 'next'
import Link from 'next/link'
import { MailCheck, ArrowLeft } from 'lucide-react'
import { ResendVerificationButton } from './ResendVerificationButton'

export const metadata: Metadata = {
  title: 'E-postanızı Doğrulayın',
  robots: { index: false },
}

export default function EmailDogrulamaGonderildiPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const email = searchParams.email ?? ''

  return (
    <div className="w-full max-w-[420px] px-4">
      <div className="bg-white rounded-2xl shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MailCheck size={32} className="text-orange" />
        </div>

        <h1 className="text-xl font-extrabold text-navy-dark mb-2">
          E-postanızı Doğrulayın
        </h1>

        <p className="text-sm text-gray-500 mb-1">
          {email ? (
            <>
              <span className="font-semibold text-navy-dark">{email}</span> adresine
              doğrulama bağlantısı gönderdik.
            </>
          ) : (
            'Kayıt e-posta adresinize doğrulama bağlantısı gönderdik.'
          )}
        </p>

        <p className="text-xs text-gray-400 mb-6">
          E-posta gelmezse spam / gereksiz klasörünüzü kontrol edin.
        </p>

        <div className="border-t border-gray-100 pt-5 space-y-3">
          <p className="text-xs text-gray-400">Bağlantı gelmedi mi?</p>
          <ResendVerificationButton email={email} />
        </div>

        <div className="mt-6">
          <Link
            href="/giris"
            className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-orange transition-colors"
          >
            <ArrowLeft size={14} />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  )
}
