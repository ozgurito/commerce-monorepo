# 📧 EMAIL SERVİSİ - HIZLI TEST REFERANSI

## 🚀 Swagger Test Senaryoları - Özet Tablo

| # | Email Tipi | Endpoint | Method | Auth | Request Body | Email Başlığı |
|---|------------|----------|--------|------|---------------|---------------|
| 1 | **Hoş Geldin** | `/api/auth/register` | POST | ❌ | `{email, password, fullName}` | "Hoş Geldiniz!" |
| 2 | **Şifre Sıfırlama** | `/api/auth/forgot-password` | POST | ❌ | `{email}` | "Şifre Sıfırlama Talebi" |
| 3 | **Sipariş Onayı** | `/api/orders` | POST | ✅ | `{items, shippingAddress, billingAddress}` | "Sipariş Onayı - #ORD-XXX" |
| 4 | **Ödeme Başarılı** | `/api/payments/iyzico/callback` | POST | ❌ | `{token}` | "Ödeme Onayı - #ORD-XXX" |
| 5 | **Ödeme Başarısız** | `/api/payments/iyzico/callback` | POST | ❌ | `{token: "gecersiz"}` | "Ödeme Başarısız - #ORD-XXX" |
| 6 | **Durum Güncelleme** | `/api/orders/{id}/status?status=PROCESSING` | PUT | ✅ ADMIN | - | "Sipariş Durumu Güncellendi - #ORD-XXX" |
| 7 | **Düşük Stok** | Manuel test | - | - | - | "⚠️ Düşük Stok Uyarısı" |

---

## 📋 DETAYLI REQUEST ÖRNEKLERİ

### 1️⃣ Hoş Geldin Emaili
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123456",
  "fullName": "Test Kullanıcı"
}
```

### 2️⃣ Şifre Sıfırlama Emaili
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

**Token Doğrulama:**
```http
GET /api/auth/reset-password/validate?token={token}
```

**Şifre Sıfırlama:**
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "{emailden_alinan_token}",
  "newPassword": "yeniSifre123",
  "confirmPassword": "yeniSifre123"
}
```

### 3️⃣ Sipariş Onay Emaili
```http
POST /api/orders
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "variantId": 1,
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No:123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "billingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No:123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "notes": "Kapıda ödeme"
}
```

### 4️⃣ Ödeme Başarılı Emaili

**Önce Checkout:**
```http
POST /api/payments/iyzico/checkout
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "orderId": 1,
  "callbackUrl": "http://localhost:8080/api/payments/iyzico/callback"
}
```

**Sonra Callback:**
```http
POST /api/payments/iyzico/callback
Content-Type: application/json

{
  "token": "{checkout_response_dan_alinan_token}"
}
```

### 5️⃣ Ödeme Başarısız Emaili
```http
POST /api/payments/iyzico/callback
Content-Type: application/json

{
  "token": "gecersiz_token_12345"
}
```

### 6️⃣ Sipariş Durumu Güncelleme Emaili
```http
PUT /api/orders/1/status?status=PROCESSING
Authorization: Bearer {admin_jwt_token}
```

**Durum Seçenekleri:**
- `PROCESSING` → "Hazırlanıyor"
- `SHIPPED` → "Kargoya Verildi"
- `DELIVERED` → "Teslim Edildi"
- `CANCELLED` → "İptal Edildi"
- `REFUNDED` → "İade Edildi"

---

## 🔑 AUTHENTICATION

### JWT Token Alma
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh-token-here",
  "id": 1,
  "email": "test@example.com",
  "fullName": "Test Kullanıcı"
}
```

**Swagger'da Kullanım:**
1. Swagger UI'da sağ üstteki **"Authorize"** butonuna tıkla
2. `Bearer {accessToken}` formatında token'ı yapıştır
3. **"Authorize"** butonuna tıkla
4. Artık tüm authenticated endpoint'ler çalışır

---

## 📊 TEST SIRASI (Önerilen)

### Adım 1: Kullanıcı Oluştur
```http
POST /api/auth/register
→ Welcome email gelir ✅
```

### Adım 2: Login Ol
```http
POST /api/auth/login
→ Token alınır ✅
```

### Adım 3: Ürün Listesi Al
```http
GET /api/products
→ productId ve variantId'leri not edin ✅
```

### Adım 4: Sipariş Oluştur
```http
POST /api/orders
→ Order confirmation email gelir ✅
```

### Adım 5: Ödeme Başlat
```http
POST /api/payments/iyzico/checkout
→ Checkout token alınır ✅
```

### Adım 6: Ödeme Callback (Başarılı)
```http
POST /api/payments/iyzico/callback
→ Payment success email gelir ✅
```

### Adım 7: Sipariş Durumu Güncelle
```http
PUT /api/orders/{id}/status?status=PROCESSING
→ Status update email gelir ✅
```

### Adım 8: Şifre Sıfırlama Testi
```http
POST /api/auth/forgot-password
→ Reset email gelir ✅
```

---

## ✅ KONTROL LİSTESİ

### Her Email İçin Kontrol Edin:
- [ ] Email gönderildi (inbox/spam kontrolü)
- [ ] Email başlığı doğru
- [ ] Email içeriği Türkçe ve doğru
- [ ] Linkler çalışıyor
- [ ] Butonlar görünüyor
- [ ] Bilgiler doğru (isim, tutar, tarih vb.)

### Genel Kontroller:
- [ ] Tüm endpoint'ler çalışıyor
- [ ] Authentication doğru çalışıyor
- [ ] Validation hataları doğru dönüyor
- [ ] Email'ler async gönderiliyor (hızlı response)
- [ ] Loglar temiz (hata yok)

---

## 🐛 SIK KARŞILAŞILAN HATALAR

### 401 Unauthorized
**Çözüm:** Login olup token alın, Swagger'da Authorize butonuna token'ı girin

### 403 Forbidden
**Çözüm:** ADMIN rolü gerekli endpoint'ler için admin kullanıcısı ile login olun

### 400 Bad Request
**Çözüm:** Request body'yi kontrol edin, tüm zorunlu alanları doldurun

### 404 Not Found
**Çözüm:** ID'leri kontrol edin, önce kayıt oluşturun

### Email Gelmiyor
**Çözüm:**
1. `application.properties` email ayarlarını kontrol edin
2. Gmail App Password doğru mu?
3. Spam klasörünü kontrol edin
4. Logları kontrol edin (email gönderim hataları)

---

## 📝 NOTLAR

- **Async Email:** Email'ler async gönderilir, response hızlıdır
- **Token Süresi:** JWT token'ların süresi dolabilir, yeniden login olun
- **Test Data:** Gerçek productId ve variantId kullanın
- **Iyzico:** Sandbox ortamında test edin
- **Admin:** Status update için ADMIN rolü gerekli

---

## 🔗 FAYDALI LİNKLER

- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/v3/api-docs
- **Health Check:** http://localhost:8080/actuator/health

---

**Son Güncelleme:** Email servisi implementasyonu sonrası
**Test Ortamı:** Local Development
**Email Provider:** Gmail SMTP

