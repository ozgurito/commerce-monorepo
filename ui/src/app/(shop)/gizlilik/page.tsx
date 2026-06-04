import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası | AlışverişNoktan',
  description: 'AlışverişNoktan gizlilik politikası ve kişisel veri işleme uygulamaları.',
}

const SECTIONS = [
  {
    title: '1. Toplanan Bilgiler',
    content:
      'Sitemizi ziyaret ettiğinizde ve alışveriş yaptığınızda ad, soyad, e-posta adresi, telefon numarası, teslimat adresi, IP adresi, tarayıcı türü ve kullanım verileri gibi bilgiler toplanabilir.',
  },
  {
    title: '2. Bilgilerin Kullanımı',
    content:
      'Toplanan bilgiler; sipariş işleme, müşteri desteği, kargo takibi, kampanya bildirimleri (izin verilmesi halinde) ve hizmetlerimizin geliştirilmesi amacıyla kullanılmaktadır.',
  },
  {
    title: '3. Bilgilerin Paylaşımı',
    content:
      'Kişisel bilgileriniz, ödeme altyapısı ve kargo firmalarımız dışında üçüncü taraflarla satılmaz veya kiralanmaz. Yasal zorunluluklar söz konusu olduğunda yetkili makamlarla paylaşılabilir.',
  },
  {
    title: '4. Çerez Kullanımı',
    content:
      'Sitemizde oturum, analiz ve kişiselleştirme amaçlı çerezler kullanılmaktadır. Çerez tercihlerinizi tarayıcı ayarlarından yönetebilirsiniz. Daha fazla bilgi için Çerez Politikamızı inceleyebilirsiniz.',
  },
  {
    title: '5. Veri Güvenliği',
    content:
      'Kişisel verileriniz SSL şifrelemesi ve güvenli sunucu altyapısı ile korunmaktadır. Ödeme bilgileriniz sistem üzerinde depolanmaz; PCI-DSS uyumlu ödeme altyapısı kullanılmaktadır.',
  },
  {
    title: '6. Veri Saklama Süresi',
    content:
      'Verileriniz yasal süreler ve hizmet ilişkimizin gerektirdiği süreler boyunca saklanır. Üyelik iptali veya başvuru üzerine verileriniz yasal yükümlülükler hariç silinir.',
  },
  {
    title: '7. Haklarınız',
    content:
      'KVKK kapsamındaki haklarınızı kvkk@alisverisnoktan.com adresine e-posta göndererek kullanabilirsiniz. Detaylı bilgi için KVKK Aydınlatma Metnimizi inceleyiniz.',
  },
]

export default function GizlilikPage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">Gizlilik Politikası</h1>
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
