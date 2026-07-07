import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni | AlışverişNoktan',
  description: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
}

const SECTIONS = [
  {
    title: '1. Veri Sorumlusu',
    content:
      'Şeyhmus Adan (Şahıs İşletmesi) — "FECCY" markası ("Şirket"), 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca veri sorumlusu sıfatıyla hareket etmektedir. İşletme unvanı: Şeyhmus Adan, Adres: İzmir.',
  },
  {
    title: '2. İşlenen Kişisel Veriler',
    content:
      'Kimlik verileri (ad, soyad), iletişim verileri (e-posta, telefon, adres), finansal veriler (ödeme bilgileri, sipariş tutarları), müşteri işlem verileri (sipariş geçmişi, iade talepleri), pazarlama verileri (çerez verileri, tercih ve ilgi alanları) işlenmektedir.',
  },
  {
    title: '3. Kişisel Verilerin İşlenme Amaçları',
    content:
      'Üyelik oluşturulması ve yönetimi, sipariş alımı ve teslimatın gerçekleştirilmesi, ödeme işlemlerinin yürütülmesi, yasal yükümlülüklerin yerine getirilmesi, müşteri hizmetleri sunulması, kampanya ve promosyon bilgilendirmesi (onay alınan durumlarda), kullanıcı deneyiminin iyileştirilmesi amaçlarıyla kişisel verileriniz işlenmektedir.',
  },
  {
    title: '4. Kişisel Verilerin Aktarıldığı Taraflar',
    content:
      'Kişisel verileriniz; kargo ve lojistik firmaları, ödeme altyapısı sağlayıcıları, bulut depolama ve teknoloji hizmeti sunan iş ortakları ile yasal zorunluluk halinde kamu kurum ve kuruluşlarıyla paylaşılabilmektedir.',
  },
  {
    title: '5. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi',
    content:
      'Kişisel verileriniz; web sitesi, mobil uygulama, müşteri hizmetleri kanalları ve benzeri yollarla toplanmaktadır. Sözleşmenin ifası, yasal yükümlülük ve meşru menfaat hukuki sebepleriyle işlenmektedir.',
  },
  {
    title: '6. KVKK Kapsamındaki Haklarınız',
    content:
      'Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmiş ise düzeltilmesini isteme, silinmesini veya yok edilmesini isteme, itiraz etme ve zararınızın giderilmesini talep etme haklarına sahipsiniz.',
  },
  {
    title: '7. Başvuru Yöntemi',
    content:
      'Haklarınızı kullanmak için kvkk@alisverisnoktan.com adresine e-posta göndererek veya yazılı başvuru aracılığıyla Şirket adresimize başvurabilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanacaktır.',
  },
]

export default function KvkkPage() {
  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">KVKK Aydınlatma Metni</h1>
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
