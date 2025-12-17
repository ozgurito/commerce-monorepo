# 💳 Iyzico Ödeme Sistemi - Swagger Test Rehberi

Swagger'dan direkt kopyalayıp kullanabileceğiniz hazır test senaryoları.

---

## 🔐 ÖN HAZIRLIK: Token Al

**1. Login Endpoint:**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**2. Token'ı Kopyala:**
Response'dan `accessToken` değerini kopyalayın.

**3. Swagger'da Authorize:**
- Sağ üstteki **"Authorize"** butonuna tıklayın
- `Bearer ` yazıp token'ı yapıştırın
- Örnek: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## 📋 ÖDEME AKIŞI ADIMLARI

Iyzico ödeme sistemi 3 adımda çalışır:

1. **Sipariş Oluştur** → Order ID al
2. **Ödeme Başlat** → Iyzico token ve ödeme sayfası URL'i al
3. **Ödeme Doğrula** → Callback ile ödemeyi tamamla

---

## 🛒 ADIM 1: Variant ID Bul

Önce ödeme yapmak istediğiniz ürünün variant ID'sini bulmalısınız.

**Method:** `GET`  
**Endpoint:** `/api/products/{productId}`

**Örnek Request:**
```
GET /api/products/1
```

**Response'dan Variant ID Al:**
```json
{
  "id": 1,
  "name": "Tişört",
  "variants": [
    {
      "id": 5,
      "name": "M - Mavi",
      "size": "M",
      "color": "Mavi",
      "stock": 10,
      ...
    }
  ]
}
```

**Not:** Response'dan `variants[0].id` değerini kopyalayın (örn: `5`)

---

## 📝 ADIM 2: Sipariş Oluştur

**Method:** `POST`  
**Endpoint:** `/api/orders`  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "items": [
    {
      "variantId": 5,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No: 123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "billingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No: 123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "notes": "Kapıda ödeme yapılabilir mi?"
}
```

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "orderNumber": "ORD-20241220-143025-123-A1B2C3D4",
  "userId": 1,
  "userEmail": "test@example.com",
  "items": [
    {
      "id": 1,
      "productId": 1,
      "productName": "Tişört",
      "variantId": 5,
      "variantName": "M - Mavi",
      "size": "M",
      "color": "Mavi",
      "quantity": 2,
      "unitPrice": 299.99,
      "totalPrice": 599.98
    }
  ],
  "subtotal": 599.98,
  "tax": 119.99,
  "shippingCost": 29.99,
  "total": 749.96,
  "status": "PENDING",
  "paymentStatus": "WAITING",
  "paymentId": null,
  "shippingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No: 123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "billingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No: 123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "createdAt": "2024-12-20T14:30:25",
  "updatedAt": "2024-12-20T14:30:25"
}
```

**ÖNEMLİ:** Response'da `variantId`, `variantName`, `size` ve `color` alanları artık görünmelidir!

**ÖNEMLİ:** Response'dan `id` değerini kopyalayın (örn: `1`) - bu `orderId`'dir.

---

## 💰 ADIM 3: Ödeme Başlat (Iyzico Checkout)

**Method:** `POST`  
**Endpoint:** `/api/payments/iyzico/checkout`  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "orderId": 1,
  "callbackUrl": "http://localhost:8080/api/payments/iyzico/callback"
}
```

**Not:** `callbackUrl` opsiyoneldir. Boş bırakılırsa `application.yml`'deki default callback URL kullanılır.

**Beklenen Response (200 OK):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "paymentPageUrl": "https://sandbox-merchant.iyzipay.com/checkout/form/eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "conversationId": "ORD-20241220-143025-123-A1B2C3D4",
  "orderNumber": "ORD-20241220-143025-123-A1B2C3D4",
  "expiresAt": "1734705025"
}
```

**ÖNEMLİ:** 
- `token` değerini kopyalayın - callback'te kullanılacak
- `paymentPageUrl`'i tarayıcıda açarak ödeme formunu görebilirsiniz (sandbox test kartları ile ödeme yapabilirsiniz)

---

## 🧪 ADIM 4: Ödeme Formunu Test Et (Iyzico Sandbox)

Iyzico sandbox'ta test kartları kullanarak ödeme yapabilirsiniz:

### ✅ Başarılı Ödeme Test Kartları:

| Kart Numarası | CVV | Son Kullanma | İsim |
|---------------|-----|--------------|------|
| `5528 7900 9000 0016` | `123` | `12/30` | `Test User` |
| `4603 4504 5305 3307` | `000` | `12/30` | `Test User` |

### ❌ Başarısız Ödeme Test Kartları:

| Kart Numarası | CVV | Son Kullanma | Sonuç |
|---------------|-----|--------------|-------|
| `5406 6707 4000 0019` | `123` | `12/30` | `Yetersiz bakiye` |
| `5406 6707 4000 0027` | `123` | `12/30` | `Kart limiti aşıldı` |

**Test Adımları:**
1. `paymentPageUrl`'i tarayıcıda açın
2. Test kartı bilgilerini girin
3. Ödeme yapın
4. Ödeme tamamlandıktan sonra callback URL'e yönlendirilir

---

## ✅ ADIM 5: Ödeme Doğrula (Callback)

**Method:** `POST`  
**Endpoint:** `/api/payments/iyzico/callback`  
**Authorization:** ❌ Gerekli değil (Iyzico tarafından çağrılır)

**Request Body:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

**Not:** `token` değeri Adım 3'te aldığınız `token` değeridir.

**Beklenen Response (200 OK) - Başarılı Ödeme:**
```json
{
  "id": 1,
  "orderNumber": "ORD-20241220-143025-123-A1B2C3D4",
  "userId": 1,
  "userEmail": "test@example.com",
  "items": [...],
  "subtotal": 599.98,
  "tax": 119.99,
  "shippingCost": 29.99,
  "total": 749.96,
  "status": "PAID",
  "paymentStatus": "PAID",
  "paymentId": "12345678",
  ...
}
```

**ÖNEMLİ:** 
- `status` artık `"PAID"` olmalı
- `paymentStatus` `"PAID"` olmalı
- `paymentId` Iyzico tarafından atanan ödeme ID'si olmalı

---

## 🔍 ADIM 6: Sipariş Durumunu Kontrol Et

Ödeme sonrası sipariş durumunu kontrol edin:

**Method:** `GET`  
**Endpoint:** `/api/orders/{id}`  
**Authorization:** ✅ Gerekli (Bearer Token)

**Örnek Request:**
```
GET /api/orders/1
```

**Beklenen Response:**
```json
{
  "id": 1,
  "orderNumber": "ORD-20241220-143025-123-A1B2C3D4",
  "status": "PAID",
  "paymentStatus": "PAID",
  "paymentId": "12345678",
  ...
}
```

---

## 📊 TAM TEST SENARYOSU

Aşağıdaki adımları sırayla takip edin:

### Senaryo 1: Başarılı Ödeme

1. ✅ **Login yap** → Token al
2. ✅ **Ürün listele** → `GET /api/products` → Variant ID bul (örn: `5`)
3. ✅ **Sipariş oluştur** → `POST /api/orders` → Order ID al (örn: `1`)
4. ✅ **Ödeme başlat** → `POST /api/payments/iyzico/checkout` → Token ve paymentPageUrl al
5. ✅ **Ödeme formunu aç** → paymentPageUrl'i tarayıcıda aç
6. ✅ **Test kartı ile ödeme yap** → `5528 7900 9000 0016` / `123` / `12/30`
7. ✅ **Callback'i test et** → `POST /api/payments/iyzico/callback` → Token ile doğrula
8. ✅ **Sipariş durumunu kontrol et** → `GET /api/orders/1` → Status `PAID` olmalı

### Senaryo 2: Başarısız Ödeme

1. ✅ Adım 1-4 (yukarıdakiyle aynı)
2. ❌ **Başarısız test kartı kullan** → `5406 6707 4000 0019` / `123` / `12/30`
3. ✅ **Callback'i test et** → `POST /api/payments/iyzico/callback` → Hata mesajı alınmalı
4. ✅ **Sipariş durumunu kontrol et** → `GET /api/orders/1` → `paymentStatus` `FAILED` olmalı

---

## ⚙️ YAPILANDIRMA NOTLARI

### application.yml Ayarları

```yaml
iyzico:
  base-url: https://sandbox-api.iyzipay.com  # Sandbox
  # base-url: https://api.iyzipay.com        # Production
  api-key: YOUR_API_KEY
  secret-key: YOUR_SECRET_KEY
  callback-url: http://localhost:8080/api/payments/iyzico/callback
  locale: tr  # veya en
```

### Iyzico Sandbox Test Bilgileri

- **Dashboard:** https://sandbox-merchant.iyzipay.com
- **API Dokümantasyon:** https://dev.iyzipay.com/tr

---

## 🔄 ÖDEME DURUMLARI

| PaymentStatus | Açıklama |
|---------------|----------|
| `WAITING` | Ödeme bekleniyor (sipariş oluşturuldu) |
| `INITIATED` | Ödeme başlatıldı (checkout çağrıldı) |
| `PAID` | Ödeme başarılı |
| `FAILED` | Ödeme başarısız |

| OrderStatus | Açıklama |
|-------------|----------|
| `PENDING` | Beklemede |
| `PAID` | Ödendi |
| `PROCESSING` | İşleniyor |
| `SHIPPED` | Kargoya verildi |
| `DELIVERED` | Teslim edildi |
| `CANCELLED` | İptal edildi |

---

## ⚠️ HATA DURUMLARI

### Hata 1: Order Not Found
```
{
  "errorCode": "ORDER_NOT_FOUND",
  "message": "Sipariş bulunamadı"
}
```
**Çözüm:** Önce sipariş oluşturduğunuzdan emin olun.

### Hata 2: Payment Already Processed
```
{
  "errorCode": "PAYMENT_ALREADY_PROCESSED",
  "message": "Bu sipariş için ödeme zaten işlendi"
}
```
**Çözüm:** Farklı bir sipariş ID'si kullanın veya yeni sipariş oluşturun.

### Hata 3: Payment Init Failed
```
{
  "errorCode": "PAYMENT_INIT_FAILED",
  "message": "Iyzico ödeme başlatılamadı: [hata mesajı]"
}
```
**Çözüm:** 
- Iyzico API anahtarlarınızı kontrol edin
- Sandbox ortamında olduğunuzdan emin olun
- Order durumunun `PENDING` olduğundan emin olun

### Hata 4: Payment Callback Invalid
```
{
  "errorCode": "PAYMENT_CALLBACK_INVALID",
  "message": "Iyzico callback geçersiz: [hata mesajı]"
}
```
**Çözüm:**
- Token'ın doğru olduğundan emin olun
- Token'ın süresi dolmamış olmalı (default: 1 saat)
- Ödeme formunda ödeme yapıldığından emin olun

---

## 📝 SWAGGER ÖRNEK REQUEST'LER

### 1. Sipariş Oluştur
```json
POST /api/orders
{
  "items": [
    {
      "variantId": 5,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No: 123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "billingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No: 123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "notes": "Test siparişi"
}
```

### 2. Ödeme Başlat
```json
POST /api/payments/iyzico/checkout
{
  "orderId": 1
}
```

### 3. Ödeme Doğrula
```json
POST /api/payments/iyzico/callback
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

---

## 🎯 ÖNEMLİ NOTLAR

1. ✅ **Variant ID zorunlu:** Artık sipariş oluştururken `variantId` zorunlu, `productId` opsiyonel
2. ✅ **Sandbox test:** Production'a geçmeden önce mutlaka sandbox'ta test edin
3. ✅ **Callback URL:** Callback URL'inizin erişilebilir olduğundan emin olun (ngrok kullanabilirsiniz)
4. ✅ **Token süresi:** Iyzico token'ları 1 saat geçerlidir
5. ✅ **Idempotency:** Aynı token ile callback'i birden fazla çağırabilirsiniz (idempotent)

---

## 🔗 FAYDALI LİNKLER

- **Iyzico Dokümantasyon:** https://dev.iyzipay.com/tr
- **Sandbox Merchant Panel:** https://sandbox-merchant.iyzipay.com
- **Test Kartları:** https://dev.iyzipay.com/tr/api/test-kartlari

---

**Test başarılı! 🎉**

