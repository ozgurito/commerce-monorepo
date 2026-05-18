'use client'

interface Chip {
  id: string
  label: string
  icon: string
  params: Record<string, string | undefined>
}

// Tüm hero-tetikleyici parametreler — her chip bunların hepsini sıfırlar, sadece kendisini set eder
const RESET: Record<string, undefined> = {
  indirim: undefined,
  yeni: undefined,
  sortBy: undefined,
  sortDir: undefined,
  minPrice: undefined,
}

const CHIPS: Chip[] = [
  {
    id: 'indirim',
    label: 'Flaş Ürünler',
    icon: '⚡',
    params: { ...RESET, indirim: 'true' },
  },
  {
    id: 'yeni',
    label: 'Yeni Gelenler',
    icon: '🆕',
    params: { ...RESET, yeni: 'true' },
  },
  {
    id: 'puan',
    label: 'Yüksek Puanlı',
    icon: '⭐',
    params: { ...RESET, sortBy: 'averageRating', sortDir: 'DESC' },
  },
  {
    id: 'kargo',
    label: 'Kargo Bedava',
    icon: '📦',
    params: { ...RESET, minPrice: '150' },
  },
  {
    id: 'coksatan',
    label: 'En Çok Satan',
    icon: '🔥',
    params: { ...RESET, sortBy: 'totalReviews', sortDir: 'DESC' },
  },
]

interface Props {
  searchParams: URLSearchParams
  onChipClick: (patch: Record<string, string | undefined>) => void
}

function isChipActive(chip: Chip, searchParams: URLSearchParams): boolean {
  return Object.entries(chip.params).every(([k, v]) => {
    if (v === undefined) return true
    return searchParams.get(k) === v
  })
}

export function QuickFilterChips({ searchParams, onChipClick }: Props) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1
                    scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                    mb-3">
      {CHIPS.map((chip) => {
        const active = isChipActive(chip, searchParams)
        return (
          <button
            key={chip.id}
            onClick={() => onChipClick(active ? {} : chip.params)}
            className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full
                        text-[12.5px] font-semibold border transition-all duration-150 flex-shrink-0
                        ${active
                          ? 'bg-orange text-white border-orange shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange hover:text-orange'
                        }`}
          >
            <span>{chip.icon}</span>
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
