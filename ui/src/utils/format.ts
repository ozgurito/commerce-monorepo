export const formatPrice = (n: number) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(n)

// Kargo politikası — tek kaynak, tüm sayfalar buradan okur
export const FREE_SHIPPING_THRESHOLD = 150        // eski fiyat bazlı (geriye dönük uyumluluk için bırakıldı)
export const FREE_SHIPPING_ITEM_COUNT = 4         // 4 ürün ve üzeri → ücretsiz kargo
export const SHIPPING_COST           = 29.90      // sabit kargo bedeli

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
