import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
      {/* PNG logo — transparan arka plan, mavi+turuncu pin+sepet */}
      <div className="w-[44px] h-[44px] flex-shrink-0 drop-shadow-lg">
        <Image
          src="/images/logo.png"
          alt="AlışverişNoktan Logo"
          width={44}
          height={44}
          className="object-contain w-full h-full"
          priority
          unoptimized
        />
      </div>

      {/* Wordmark */}
      <div className="flex items-baseline leading-none">
        <span className="text-[18px] font-black text-white tracking-tight group-hover:text-white/90 transition-colors">
          Alışveriş
        </span>
        <span className="text-[18px] font-black text-orange tracking-tight group-hover:text-orange/90 transition-colors">
          Noktan
        </span>
      </div>
    </Link>
  )
}
