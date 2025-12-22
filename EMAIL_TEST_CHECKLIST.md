# 📧 EMAIL SERVİSİ - SWAGGER TEST KONTROL LİSTESİ

## 🎯 Test Senaryoları ve Kontrol Listesi

### ⚙️ ÖN HAZIRLIK

1. **Swagger UI'ya Erişim**
   - URL: `http://localhost:8080/swagger-ui.html`
   - Veya: `http://localhost:8080/swagger-ui/index.html`

2. **Authentication Setup**
   - Önce bir kullanıcı kaydedin veya login olun
   - JWT token'ı alın ve "Authorize" butonuna tıklayın
   - Token'ı `Bearer {token}` formatında girin

3. **Email Ayarları Kontrolü**
   - `application.properties` dosyasında email ayarlarının doğru olduğundan emin olun
   - Gmail App Password oluşturulmuş olmalı

---

## 📋 TEST SENARYOLARI

### 1️⃣ HOŞ GELDİN EMAİLİ (Welcome Email)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "test@example.com",
  "password": "test123456",
  "fullName": "Test Kullanıcı"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/auth/register` endpoint'ini aç
2. ✅ "Try it out" butonuna tıkla
3. ✅ Request body'yi yukarıdaki gibi doldur
4. ✅ "Execute" butonuna tıkla
5. ✅ Response'da `200 OK` ve kullanıcı bilgileri dönmeli
6. ✅ Email kutusunu kontrol et - "Hoş Geldiniz!" başlıklı email gelmeli
7. ✅ Email'de "Alışverişe Başla" butonu olmalı

**Beklenen Sonuç:**
- ✅ Kullanıcı başarıyla kaydedildi
- ✅ Email gönderildi (async)
- ✅ Email içeriği doğru (kullanıcı adı, linkler)

---

### 2️⃣ ŞİFRE SIFIRLAMA EMAİLİ (Password Reset Email)

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/auth/forgot-password` endpoint'ini aç
2. ✅ "Try it out" butonuna tıkla
3. ✅ Request body'de kayıtlı bir email adresi gir
4. ✅ "Execute" butonuna tıkla
5. ✅ Response'da `200 OK` ve `"message": "Eğer bu email kayıtlıysa..."` mesajı dönmeli
6. ✅ Email kutusunu kontrol et - "Şifre Sıfırlama Talebi" başlıklı email gelmeli
7. ✅ Email'de reset link'i olmalı (token ile)
8. ✅ Link'e tıklayınca frontend reset sayfasına yönlendirmeli

**Token Doğrulama:**
**Endpoint:** `GET /api/auth/reset-password/validate?token={token}`

**Test Adımları:**
1. ✅ Email'den token'ı kopyala
2. ✅ Swagger'da `/api/auth/reset-password/validate` endpoint'ini aç
3. ✅ Query parameter olarak `token={emailden_alinan_token}` gir
4. ✅ "Execute" butonuna tıkla
5. ✅ Response'da `"valid": true` dönmeli

**Şifre Sıfırlama:**
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "emailden_alinan_token",
  "newPassword": "yeniSifre123",
  "confirmPassword": "yeniSifre123"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/auth/reset-password` endpoint'ini aç
2. ✅ Request body'yi yukarıdaki gibi doldur
3. ✅ "Execute" butonuna tıkla
4. ✅ Response'da `200 OK` ve `"message": "Şifreniz başarıyla güncellendi."` dönmeli
5. ✅ Yeni şifre ile login olunabilmeli

**Beklenen Sonuç:**
- ✅ Email gönderildi
- ✅ Token geçerli
- ✅ Şifre başarıyla değiştirildi

---

### 3️⃣ SİPARİŞ ONAY EMAİLİ (Order Confirmation Email)

**ÖN KOŞUL:** Önce ürün ve variant ID'lerini alın

**Ürün Listesi:**
**Endpoint:** `GET /api/products`

**Variant ID Bulma:**
- Ürün detayında variant bilgileri var
- Veya database'den kontrol edin

**Endpoint:** `POST /api/orders`

**Request Body:**
```json
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
    "addressLine": "Atatürk Caddesi No:123 Daire:5",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "billingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "+905551234567",
    "addressLine": "Atatürk Caddesi No:123 Daire:5",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Turkey"
  },
  "notes": "Kapıda ödeme yapabilir miyim?"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/orders` endpoint'ini aç
2. ✅ "Authorize" butonuna tıkla ve JWT token'ı gir
3. ✅ "Try it out" butonuna tıkla
4. ✅ Request body'yi yukarıdaki gibi doldur (gerçek productId ve variantId ile)
5. ✅ "Execute" butonuna tıkla
6. ✅ Response'da `200 OK` ve sipariş detayları dönmeli
7. ✅ Email kutusunu kontrol et - "Sipariş Onayı - #ORD-XXX" başlıklı email gelmeli
8. ✅ Email'de şunlar olmalı:
   - ✅ Sipariş numarası
   - ✅ Sipariş tarihi
   - ✅ Ürün listesi (ad, adet, fiyat)
   - ✅ Ara toplam, KDV, Kargo, Toplam
   - ✅ Teslimat adresi
   - ✅ "Siparişimi Görüntüle" butonu

**Beklenen Sonuç:**
- ✅ Sipariş başarıyla oluşturuldu
- ✅ Email gönderildi
- ✅ Email içeriği doğru (tüm sipariş detayları)

---

### 4️⃣ ÖDEME BAŞARILI EMAİLİ (Payment Success Email)

**ÖN KOŞUL:** Önce bir sipariş oluşturun (yukarıdaki adımlar)

**Endpoint:** `POST /api/payments/iyzico/checkout`

**Request Body:**
```json
{
  "orderId": 1,
  "callbackUrl": "http://localhost:8080/api/payments/iyzico/callback"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/payments/iyzico/checkout` endpoint'ini aç
2. ✅ "Authorize" butonuna tıkla ve JWT token'ı gir
3. ✅ "Try it out" butonuna tıkla
4. ✅ Request body'de oluşturduğunuz siparişin ID'sini girin
5. ✅ "Execute" butonuna tıkla
6. ✅ Response'da `paymentPageUrl` ve `token` dönmeli

**Callback Simülasyonu:**
**Endpoint:** `POST /api/payments/iyzico/callback`

**Request Body:**
```json
{
  "token": "checkout_response_dan_alinan_token"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/payments/iyzico/callback` endpoint'ini aç
2. ✅ "Try it out" butonuna tıkla
3. ✅ Request body'de checkout'tan aldığınız token'ı girin
4. ✅ "Execute" butonuna tıkla
5. ✅ Response'da `200 OK` ve sipariş detayları dönmeli
6. ✅ Email kutusunu kontrol et - "Ödeme Onayı - #ORD-XXX" başlıklı email gelmeli
7. ✅ Email'de şunlar olmalı:
   - ✅ Sipariş numarası
   - ✅ Ödeme tutarı (büyük ve yeşil)
   - ✅ İşlem numarası (paymentId)
   - ✅ "Sipariş Takibi" butonu

**Beklenen Sonuç:**
- ✅ Ödeme başarılı olarak işaretlendi
- ✅ Email gönderildi
- ✅ Email içeriği doğru (ödeme bilgileri)

---

### 5️⃣ ÖDEME BAŞARISIZ EMAİLİ (Payment Failed Email)

**Test Senaryosu 1: Geçersiz Token ile**

**Endpoint:** `POST /api/payments/iyzico/callback`

**Request Body:**
```json
{
  "token": "gecersiz_token_12345"
}
```

**Test Adımları:**
1. ✅ Swagger'da `/api/payments/iyzico/callback` endpoint'ini aç
2. ✅ "Try it out" butonuna tıkla
3. ✅ Request body'de geçersiz bir token girin
4. ✅ "Execute" butonuna tıkla
5. ✅ Response'da hata mesajı dönmeli
6. ✅ Email kutusunu kontrol et - "Ödeme Başarısız - #ORD-XXX" başlıklı email gelmeli
7. ✅ Email'de şunlar olmalı:
   - ✅ Sipariş numarası
   - ✅ Hata mesajı (kırmızı kutu içinde)
   - ✅ "Tekrar Dene" butonu

**Beklenen Sonuç:**
- ✅ Hata yakalandı
- ✅ Email gönderildi
- ✅ Email içeriği doğru (hata mesajı)

---

### 6️⃣ SİPARİŞ DURUMU GÜNCELLEME EMAİLİ (Order Status Update Email)

**ÖN KOŞUL:** Önce bir sipariş oluşturun ve ödeme yapın

**Endpoint:** `PUT /api/orders/{id}/status?status=PROCESSING`

**Path Parameters:**
- `id`: Sipariş ID (örn: 1)

**Query Parameters:**
- `status`: `PROCESSING` | `SHIPPED` | `DELIVERED` | `CANCELLED` | `REFUNDED`

**Test Adımları:**
1. ✅ Swagger'da `/api/orders/{id}/status` endpoint'ini aç
2. ✅ "Authorize" butonuna tıkla ve **ADMIN** rolüne sahip bir token girin
3. ✅ "Try it out" butonuna tıkla
4. ✅ Path parameter olarak sipariş ID'sini girin
5. ✅ Query parameter olarak `status=PROCESSING` girin
6. ✅ "Execute" butonuna tıkla
7. ✅ Response'da `200 OK` ve güncellenmiş sipariş dönmeli
8. ✅ Email kutusunu kontrol et - "Sipariş Durumu Güncellendi - #ORD-XXX" başlıklı email gelmeli
9. ✅ Email'de şunlar olmalı:
   - ✅ Sipariş numarası
   - ✅ Yeni durum (mavi kutu içinde)
   - ✅ "Sipariş Detayları" butonu

**Farklı Durumlar için Test:**
- ✅ `status=SHIPPED` → "Kargoya Verildi" emaili
- ✅ `status=DELIVERED` → "Teslim Edildi" emaili
- ✅ `status=CANCELLED` → "İptal Edildi" emaili

**Beklenen Sonuç:**
- ✅ Sipariş durumu güncellendi
- ✅ Email gönderildi
- ✅ Email içeriği doğru (yeni durum bilgisi)

---

### 7️⃣ DÜŞÜK STOK UYARISI EMAİLİ (Low Stock Alert Email)

**NOT:** Bu email admin'e gönderilir. Manuel test için EmailService'i direkt çağırabilirsiniz veya stok düşürme işlemi yapın.

**Test Senaryosu:**
1. ✅ Bir ürünün stokunu düşük seviyeye getirin (database'den veya admin panelinden)
2. ✅ Stok kontrolü yapan bir işlem tetikleyin
3. ✅ Admin email kutusunu kontrol et - "⚠️ Düşük Stok Uyarısı: {Ürün Adı}" başlıklı email gelmeli
4. ✅ Email'de şunlar olmalı:
   - ✅ Ürün adı
   - ✅ Mevcut stok (kırmızı)
   - ✅ Eşik değeri
   - ✅ "Stok Yönetimi" butonu

**Beklenen Sonuç:**
- ✅ Email gönderildi
- ✅ Email içeriği doğru (stok bilgileri)

---

## 🔍 GENEL KONTROL LİSTESİ

### Email Gönderim Kontrolleri
- ✅ Tüm email'ler async gönderiliyor (response hızlı)
- ✅ Email'ler doğru adrese gidiyor
- ✅ Email içeriği Türkçe ve doğru formatlanmış
- ✅ Email'lerde linkler çalışıyor
- ✅ Email'lerde butonlar görünüyor ve tıklanabilir

### Hata Senaryoları
- ✅ Geçersiz email adresi → Hata mesajı
- ✅ Geçersiz token → Hata mesajı
- ✅ Eksik parametreler → Validation hatası
- ✅ Yetkisiz erişim → 403 Forbidden

### Performans Kontrolleri
- ✅ Email gönderimi HTTP response'u bloklamıyor
- ✅ Birden fazla email aynı anda gönderilebiliyor
- ✅ Email gönderim hataları loglanıyor

---

## 📝 TEST NOTLARI

### Swagger'da Test Ederken:
1. **Authentication:** Her endpoint için "Authorize" butonuna tıklayıp token girin
2. **Request Body:** JSON formatında, tırnak işaretlerine dikkat edin
3. **Path Parameters:** URL'deki `{id}` gibi değerleri değiştirin
4. **Query Parameters:** `?status=PROCESSING` gibi parametreleri ekleyin

### Email Kontrolü:
1. **Gmail:** Spam klasörünü de kontrol edin
2. **Logs:** Uygulama loglarında email gönderim mesajlarını kontrol edin
3. **Async:** Email'ler async gönderildiği için 1-2 saniye bekleyin

### Hata Ayıklama:
- Email gönderilmiyorsa → `application.properties` ayarlarını kontrol edin
- Email içeriği boşsa → Thymeleaf template'lerini kontrol edin
- Linkler çalışmıyorsa → `app.frontend-url` ayarını kontrol edin

---

## ✅ BAŞARI KRİTERLERİ

Tüm test senaryoları başarılı olmalı:
- ✅ 7 farklı email tipi test edildi
- ✅ Tüm email'ler doğru adrese gönderildi
- ✅ Email içerikleri doğru ve tam
- ✅ Linkler ve butonlar çalışıyor
- ✅ Hata durumları doğru yönetiliyor
- ✅ Async çalışma doğrulandı

---

## 🚀 HIZLI TEST SIRASI

1. **Register** → Welcome email ✅
2. **Forgot Password** → Reset email ✅
3. **Create Order** → Order confirmation email ✅
4. **Payment Callback (Success)** → Payment success email ✅
5. **Payment Callback (Failed)** → Payment failed email ✅
6. **Update Order Status** → Status update email ✅

---

**Son Güncelleme:** Email servisi implementasyonu tamamlandıktan sonra
**Test Tarihi:** _______________
**Test Eden:** _______________
**Sonuç:** ☐ Başarılı  ☐ Başarısız (Notlar: _______________)

