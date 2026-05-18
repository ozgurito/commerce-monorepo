import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight, MessageCircle } from 'lucide-react'
import { SSSAccordion } from './SSSAccordion'

export const metadata: Metadata = {
  title: 'Sıkça Sorulan Sorular | AlışverişNoktan',
  description:
    'AlışverişNoktan hakkında sipariş, kargo, iade ve ödeme konularındaki sık sorulan sorular.',
}

const SSS_ITEMS = [
  {
    q: 'Siparişim ne kadar sürede teslim edilir?',
    a: 'Siparişiniz onaylandıktan sonra aynı gün veya en geç 1 iş günü içinde kargoya teslim edilir. Kargo süresi bulunduğunuz şehre göre 1–3 iş günü arasında değişmektedir. Kargo takip numaranızı sipariş onay e-postanızda bulabilirsiniz.',
  },
  {
    q: 'Ücretsiz kargo eşiği nedir?',
    a: '150₺ ve üzeri siparişlerinizde kargo tamamen ücretsizdir. Sepet toplamınız 150₺\'nin altında kalırsa sabit 29,90₺ kargo ücreti uygulanır.',
  },
  {
    q: 'Ürünü iade edebilir miyim?',
    a: 'Evet! Teslim tarihinden itibaren 30 gün içinde, ürünü kullanmamış ve etiketini sökmemiş olmanız koşuluyla koşulsuz iade hakkınız bulunmaktadır. İade talebinizi "Hesabım > Siparişlerim" bölümünden başlatabilirsiniz.',
  },
  {
    q: 'Beden seçiminde nasıl karar vermeliyim?',
    a: 'Her ürün sayfasında beden rehberi bulunmaktadır. Göğüs, bel ve kalça ölçülerinizi alarak tablodaki karşılığını seçmenizi öneririz. İki beden arası kaldıysanız oversize model için büyük, regular fit için küçük bedeni tercih edin.',
  },
  {
    q: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
    a: 'Kredi kartı (tek çekim veya taksitli), banka/kredi kartı ile 3D Secure ve havale/EFT seçeneklerini kabul ediyoruz. Tüm kredi kartı işlemleri İyzico güvencesiyle gerçekleştirilmektedir.',
  },
  {
    q: 'Siparişimi nasıl takip ederim?',
    a: '"Hesabım > Siparişlerim" sayfasından kargo takip numaranıza ulaşabilirsiniz. Kargo firmasının web sitesi veya uygulaması üzerinden anlık takip yapabilirsiniz. Ayrıca kargo teslim edildiğinde SMS ve e-posta bildirimi alırsınız.',
  },
  {
    q: 'İndirim kuponu nasıl kullanırım?',
    a: 'Sepetinizi oluşturduktan sonra ödeme sayfasında "Kupon Kodu" alanına kodunuzu girin ve "Uygula" butonuna basın. İndirim otomatik olarak toplam tutardan düşülür. Her kupon yalnızca bir kez kullanılabilir.',
  },
  {
    q: 'Hesabım olmadan sipariş verebilir miyim?',
    a: 'Evet, misafir olarak da alışveriş yapabilirsiniz. Ancak sipariş geçmişinizi takip etmek, iade süreçlerini kolayca yönetmek ve özel tekliflerden haberdar olmak için ücretsiz hesap oluşturmanızı öneririz.',
  },
  {
    q: 'Stokta olmayan bir ürün için ne yapabilirim?',
    a: 'Ürün sayfasındaki "Stok Gelince Haber Ver" butonuna tıklayarak e-posta adresinizi bırakabilirsiniz. Ürün tekrar stoka girdiğinde otomatik bildirim alırsınız.',
  },
  {
    q: 'Faturamı nasıl alabilirim?',
    a: 'E-faturanız siparişiniz kargoya verildikten sonra kayıtlı e-posta adresinize otomatik olarak gönderilir. "Hesabım > Siparişlerim" bölümünden de PDF olarak indirebilirsiniz.',
  },
]

export default function SSSPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-navy-dark to-navy py-10 px-4 sm:px-6 lg:px-10 xl:px-14">
        <nav className="flex items-center gap-1 text-xs text-white/50 mb-4">
          <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
          <ChevronRight size={12} />
          <span className="text-white/80">Sıkça Sorulan Sorular</span>
        </nav>
        <h1 className="text-3xl font-extrabold text-white mb-2">Sıkça Sorulan Sorular</h1>
        <p className="text-white/70 text-sm max-w-xl">
          Merak ettiklerinizi burada bulamazsanız bize yazın, en geç 24 saat içinde yanıt verelim.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10 py-12 space-y-8">

        <SSSAccordion items={SSS_ITEMS} />

        {/* Hâlâ sorun var? */}
        <div className="bg-orange/5 border border-orange/20 rounded-2xl p-6 flex flex-col sm:flex-row
                        items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 bg-orange/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <MessageCircle size={22} className="text-orange" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-navy-dark text-sm">Aradığınızı bulamadınız mı?</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Destek ekibimiz size yardımcı olmaktan memnuniyet duyar.
            </p>
          </div>
          <Link
            href="/iletisim"
            className="bg-orange hover:bg-orange-dark text-white font-bold px-5 py-2.5
                       rounded-xl text-sm transition-colors whitespace-nowrap"
          >
            Bize Ulaşın
          </Link>
        </div>

      </div>
    </div>
  )
}
