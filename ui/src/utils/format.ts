export const formatPrice = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)

// Kargo politikası — tek kaynak, tüm sayfalar buradan okur
// 1000₺ ve üzeri (ara toplam, indirim öncesi) → ücretsiz; altında sabit 100₺
export const FREE_SHIPPING_THRESHOLD = 1000       // ₺ — ara toplam eşiği
export const SHIPPING_COST           = 100        // sabit kargo bedeli (eşik altı)

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long' }).format(new Date(iso))

export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat('tr-TR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(iso))

// Gerçek OrderStatus enum'undan türetildi (HANDOFF'taki CONFIRMED/PREPARING yok)
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING:    'Beklemede',
  PAID:       'Ödendi',
  PROCESSING: 'Hazırlanıyor',
  SHIPPED:    'Kargoda',
  DELIVERED:  'Teslim Edildi',
  CANCELLED:  'İptal Edildi',
  REFUNDED:   'İade Edildi',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CREDIT_CARD:      'Kredi Kartı',
  BANK_TRANSFER:    'Havale / EFT',
  CASH_ON_DELIVERY: 'Kapıda Ödeme',
}
