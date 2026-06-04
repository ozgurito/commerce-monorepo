import { Mail, MessageCircle } from 'lucide-react'

export function ContactForm() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
      <h2 className="font-extrabold text-navy-dark text-lg">Bize Yazın</h2>

      <div className="bg-orange/5 border border-orange/20 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          İletişim formu yakında aktif olacak. Şu an için doğrudan bizimle iletişime geçebilirsiniz:
        </p>
      </div>

      <div className="space-y-3">
        <a
          href="mailto:destek@alisverisnoktan.com"
          className="flex items-center gap-3 w-full bg-navy-dark hover:bg-navy text-white
                     font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          <Mail size={16} />
          destek@alisverisnoktan.com
        </a>
        <a
          href="https://wa.me/905418771635"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white
                     font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          <MessageCircle size={16} />
          WhatsApp ile Yazın
        </a>
      </div>
    </div>
  )
}
