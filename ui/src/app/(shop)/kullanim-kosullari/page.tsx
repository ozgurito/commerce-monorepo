import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | AlışverişNoktan',
  description: 'AlışverişNoktan kullanım koşulları ve üyelik sözleşmesi.',
}

const SECTIONS = [
  {
    title: '1. Genel Hükümler',
    content:
      'Bu kullanım koşulları, AlışverişNoktan Elektronik Ticaret A.Ş. ("Şirket") ile siteyi kullanan kişiler ("Kullanıcı") arasındaki ilişkiyi düzenlemektedir. Siteye erişim sağlayarak bu koşulları kabul etmiş sayılırsınız.',
  },
  {
    title: '2. Üyelik',
    content:
      '18 yaşını doldurmuş her gerçek kişi üye olabilir. Üyelik bilgilerinizin doğruluğundan sorumlusunuz. Şifrenizin güvenliğini korumak sizin sorumluluğunuzdadır. Şirket, herhangi bir gerekçe göstermeksizin üyeliği sonlandırma hakkını saklı tutar.',
  },
  {
    title: '3. Sipariş ve Sözleşme',
    content:
      'Sepete ekleme ve sipariş onayı bir satış taahhüdü oluşturmaz; Şirketin siparişi kabul etmesiyle satış sözleşmesi kurulur. Stok yetersizliği veya hatalı fiyatlandırma gibi durumlarda Şirket siparişi iptal etme hakkına sahiptir.',
  },
  {
    title: '4. Fiyat ve Ödeme',
    content:
      'Fiyatlar TL cinsinden olup KDV dahildir. Şirket, önceden haber vermeksizin fiyatları değiştirebilir. Ödeme, sipariş sırasında belirtilen yöntemlerle gerçekleştirilir.',
  },
  {
    title: '5. Teslimat',
    content:
      'Teslimat süresi, stok durumu ve adres bilgisine göre değişmekle birlikte genellikle 2-5 iş günüdür. Belirtilen süre tahmini olup gecikmelerde Şirket sorumlu tutulamaz.',
  },
  {
    title: '6. İade ve Değişim',
    content:
      'Teslim tarihinden itibaren 14 gün içinde iade talebinde bulunabilirsiniz. Ürünün kullanılmamış, orijinal ambalajında ve etiketleri yerinde olması gerekmektedir. Kişiye özel ürünlerde iade kabul edilmez.',
  },
  {
    title: '7. Fikri Mülkiyet',
    content:
      'Sitedeki tüm içerik, logo, tasarım ve materyaller Şirkete aittir. İzinsiz kopyalanamaz, çoğaltılamaz veya dağıtılamaz.',
  },
  {
    title: '8. Sorumluluk Sınırlaması',
    content:
      'Şirket, kullanıcı hataları veya üçüncü taraf kaynaklı problemlerden doğan zararlardan sorumlu değildir. Hizmetin kesintisiz çalışacağı garanti edilmemektedir.',
  },
]

export default function KullanimKosullariPage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">Kullanım Koşulları</h1>
      <p className="text-gray-400 text-sm mb-10">Son güncelleme: Ocak 2025</p>

      <div className="space-y-8">
        {SECTIONS.map(({ title, content }) => (
          <section key={title}>
            <h2 className="text-lg font-bold text-navy-dark mb-2">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{content}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
