import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-[10px] flex-shrink-0 group">
      {/* Icon */}
      <div className="w-[42px] h-[42px] flex-shrink-0">
        <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <rect width="42" height="42" rx="10" fill="#F27A1A" />
          <path d="M21 8L30 14V22C30 27.5 26 32.2 21 34C16 32.2 12 27.5 12 22V14L21 8Z"
                fill="white" fillOpacity="0.2" />
          <path d="M15 20H27M21 14V28" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="21" cy="21" r="5" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </div>
      {/* Wordmark */}
      <div className="flex items-baseline leading-none">
        <span className="text-[19px] font-black text-white tracking-tight">Alışveriş</span>
        <span className="text-[19px] font-black text-orange tracking-tight">Noktan</span>
      </div>
    </Link>
  )
}
