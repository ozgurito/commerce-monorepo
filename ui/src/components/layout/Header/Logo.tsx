import Link from 'next/link'
import Image from 'next/image'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
      {/* Kendi Logonuz - Etrafındaki kareli zemini gizlemek için şık bir "Rozet" içine alındı */}
      <div className="relative w-11 h-11 flex-shrink-0 bg-white rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.2)] border-2 border-white/10 overflow-hidden transform group-hover:scale-105 transition-transform duration-300">
        <Image
          src="/images/logo.webp"
          alt="AlışverişNoktan Logo"
          width={44}
          height={44}
          className="object-contain w-[90%] h-[90%] mix-blend-multiply"
          priority
          unoptimized
        />
      </div>

      {/* Modern Wordmark */}
      <div className="flex items-baseline leading-none tracking-tight">
        <span className="text-[22px] font-extrabold text-white group-hover:text-white/90 transition-colors">
          Alışveriş
        </span>
        <span className="text-[22px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange to-[#ff5722] ml-[1px]">
          Noktan
        </span>
      </div>
    </Link>
  )
}
