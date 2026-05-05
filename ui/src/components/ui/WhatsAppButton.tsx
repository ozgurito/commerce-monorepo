'use client'
import { useState } from 'react'

const WHATSAPP_NUMBER = '905001234567'
const WHATSAPP_MESSAGE = 'Merhaba! AlışverişNoktan hakkında bilgi almak istiyorum.'

export default function WhatsAppButton() {
  const [hovered, setHovered] = useState(false)

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group"
    >
      {/* Tooltip */}
      <span
        className={`bg-gray-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg
                    shadow-lg whitespace-nowrap transition-all duration-200 select-none
                    ${hovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'}`}
      >
        Yardım & Destek
      </span>

      {/* Button */}
      <div
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center
                   transition-transform duration-200 active:scale-95
                   hover:scale-110"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* WhatsApp SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="white"
          width="28"
          height="28"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.112 1.523 5.836L.057 23.215a.75.75 0 0 0 .928.928l5.379-1.466A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.922 0-3.726-.512-5.278-1.406l-.378-.22-3.923 1.069 1.069-3.923-.22-.378A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
      </div>

      {/* Pulse ring */}
      <span
        className="absolute right-0 bottom-0 w-14 h-14 rounded-full animate-ping opacity-30 pointer-events-none"
        style={{ backgroundColor: '#25D366' }}
      />
    </a>
  )
}
