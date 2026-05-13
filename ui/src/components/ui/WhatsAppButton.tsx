const WHATSAPP_NUMBER = '905418771635'
const WHATSAPP_MESSAGE = 'Merhaba! AlışverişNoktan hakkında bilgi almak istiyorum.'

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geç"
      className="fixed bottom-6 right-6 z-50"
    >
      <div
        className="w-[56px] h-[56px] rounded-full shadow-2xl flex items-center justify-center
                   hover:scale-110 active:scale-95 transition-transform duration-200"
        style={{ backgroundColor: '#25D366' }}
      >
        {/* Resmi WhatsApp logosu SVG */}
        <svg viewBox="0 0 32 32" width="34" height="34" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M16 2C8.268 2 2 8.268 2 16c0 2.478.675 4.8 1.85 6.79L2 30l7.42-1.82A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2z"
            fill="#25D366"
          />
          <path
            d="M16 4.5C9.596 4.5 4.5 9.596 4.5 16c0 2.21.638 4.27 1.74 6.01l.27.43-1.14 4.17 4.28-1.12.41.24A11.45 11.45 0 0 0 16 27.5c6.404 0 11.5-5.096 11.5-11.5S22.404 4.5 16 4.5z"
            fill="white"
          />
          <path
            d="M21.5 18.77c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.68.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.23-.24-.58-.49-.5-.68-.51-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35z"
            fill="#25D366"
          />
        </svg>
      </div>
    </a>
  )
}
