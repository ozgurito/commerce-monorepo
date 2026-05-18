'use client'
import { useState } from 'react'
import type { Metadata } from 'next'

const tabs = ['Erkek', 'Kadın', 'Unisex'] as const
type Tab = typeof tabs[number]

const ERKEK_BEDENLER = [
  { beden: 'XS',  gogus: '84–88',  bel: '70–74',  kalca: '88–92',  boy: '163–168' },
  { beden: 'S',   gogus: '88–92',  bel: '74–78',  kalca: '92–96',  boy: '168–173' },
  { beden: 'M',   gogus: '92–96',  bel: '78–82',  kalca: '96–100', boy: '173–178' },
  { beden: 'L',   gogus: '96–100', bel: '82–86',  kalca: '100–104',boy: '178–183' },
  { beden: 'XL',  gogus: '100–104',bel: '86–90',  kalca: '104–108',boy: '183–188' },
  { beden: 'XXL', gogus: '104–110',bel: '90–96',  kalca: '108–114',boy: '188–193' },
  { beden: '2XL', gogus: '110–116',bel: '96–102', kalca: '114–120',boy: '188–193' },
  { beden: '3XL', gogus: '116–122',bel: '102–108',kalca: '120–126',boy: '188–193' },
  { beden: '4XL', gogus: '122–128',bel: '108–114',kalca: '126–132',boy: '188–193' },
  { beden: '5XL', gogus: '128–134',bel: '114–120',kalca: '132–138',boy: '188–193' },
]

const KADIN_BEDENLER = [
  { beden: 'XS',  gogus: '80–84',  bel: '62–66',  kalca: '86–90',  boy: '155–160' },
  { beden: 'S',   gogus: '84–88',  bel: '66–70',  kalca: '90–94',  boy: '160–165' },
  { beden: 'M',   gogus: '88–92',  bel: '70–74',  kalca: '94–98',  boy: '165–170' },
  { beden: 'L',   gogus: '92–96',  bel: '74–78',  kalca: '98–102', boy: '170–175' },
  { beden: 'XL',  gogus: '96–102', bel: '78–84',  kalca: '102–108',boy: '170–175' },
  { beden: 'XXL', gogus: '102–108',bel: '84–90',  kalca: '108–114',boy: '170–175' },
  { beden: '2XL', gogus: '108–114',bel: '90–96',  kalca: '114–120',boy: '170–175' },
  { beden: '3XL', gogus: '114–120',bel: '96–102', kalca: '120–126',boy: '170–175' },
  { beden: '4XL', gogus: '120–126',bel: '102–108',kalca: '126–132',boy: '170–175' },
  { beden: '5XL', gogus: '126–132',bel: '108–114',kalca: '132–138',boy: '170–175' },
]

const UNISEX_BEDENLER = [
  { beden: 'XS',  gogus: '80–88',  bel: '62–74',  kalca: '86–92' },
  { beden: 'S',   gogus: '88–92',  bel: '74–78',  kalca: '92–96' },
  { beden: 'M',   gogus: '92–96',  bel: '78–82',  kalca: '96–100' },
  { beden: 'L',   gogus: '96–102', bel: '82–86',  kalca: '100–104' },
  { beden: 'XL',  gogus: '100–108',bel: '86–90',  kalca: '104–110' },
  { beden: 'XXL', gogus: '104–114',bel: '90–96',  kalca: '108–116' },
  { beden: '2XL', gogus: '110–120',bel: '96–104', kalca: '114–122' },
  { beden: '3XL', gogus: '118–126',bel: '104–112',kalca: '122–128' },
  { beden: '4XL', gogus: '124–132',bel: '112–120',kalca: '128–136' },
  { beden: '5XL', gogus: '130–138',bel: '120–128',kalca: '136–144' },
]

export default function BedenRehberiPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Erkek')

  const data = activeTab === 'Erkek' ? ERKEK_BEDENLER : activeTab === 'Kadın' ? KADIN_BEDENLER : UNISEX_BEDENLER
  const hasKolonu = activeTab !== 'Unisex'

  return (
    <div className="max-w-[860px] mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold text-navy-dark mb-2">Beden Rehberi</h1>
      <p className="text-gray-500 mb-8">Doğru bedeni seçmek için ölçülerinizi alın ve tabloyla karşılaştırın</p>

      {/* Nasıl ölçüm alınır */}
      <section className="mb-8 bg-orange/5 border border-orange/20 rounded-2xl p-5">
        <h2 className="font-bold text-gray-800 mb-3">📏 Nasıl Ölçüm Alınırsınız?</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-600">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Göğüs</p>
            <p>Kollarınızı indirin, mezurayı koltukaltı hizasından göğsünüzün en geniş noktasından geçirin.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Bel</p>
            <p>Belinizdeki en ince noktadan, mezurayı vücudunuza paralel tutarak ölçün.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1">Kalça</p>
            <p>Kalçanızın en geniş noktasından çepeçevre geçirin. Mezura yere paralel olsun.</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all
                        ${activeTab === tab
                          ? 'bg-navy-dark text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tablo */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy-dark text-white">
              <th className="text-left px-4 py-3 font-bold">Beden</th>
              <th className="text-left px-4 py-3 font-bold">Göğüs (cm)</th>
              <th className="text-left px-4 py-3 font-bold">Bel (cm)</th>
              <th className="text-left px-4 py-3 font-bold">Kalça (cm)</th>
              {hasKolonu && <th className="text-left px-4 py-3 font-bold">Boy (cm)</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.beden} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 font-extrabold text-orange">{row.beden}</td>
                <td className="px-4 py-3 text-gray-700">{row.gogus}</td>
                <td className="px-4 py-3 text-gray-700">{row.bel}</td>
                <td className="px-4 py-3 text-gray-700">{row.kalca}</td>
                {'boy' in row && hasKolonu && (
                  <td className="px-4 py-3 text-gray-700">{String(row.boy)}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Not */}
      <p className="text-xs text-gray-400 mt-4">
        * Beden tablosu genel bir rehberdir. Ürüne göre küçük farklılıklar olabilir.
        Tam bilgi için ürün sayfasındaki beden notlarını incelemenizi öneririz.
      </p>
    </div>
  )
}
