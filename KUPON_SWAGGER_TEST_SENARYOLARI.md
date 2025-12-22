# 🎫 KUPON SİSTEMİ - SWAGGER TEST SENARYOLARI

## 📋 İçindekiler
1. [Admin - Kupon Yönetimi](#admin-kupon-yönetimi)
2. [Public - Kupon Kullanımı](#public-kupon-kullanımı)
3. [Sipariş ile Kupon Entegrasyonu](#sipariş-ile-kupon-entegrasyonu)
4. [Hata Senaryoları](#hata-senaryoları)

---

## 🔐 ÖN HAZIRLIK

### 1. Admin Token Al
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response'dan `accessToken` al ve Swagger'da "Authorize" butonuna tıklayıp token'ı ekle.**

---

## 📝 ADMIN - KUPON YÖNETİMİ

### Senaryo 1: Yüzdelik İndirim Kuponu Oluştur

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "code": "YENI20",
  "description": "Yeni üyelere %20 indirim",
  "discountType": "PERCENTAGE",
  "discountValue": 20.00,
  "minimumOrderAmount": 100.00,
  "maximumDiscountAmount": 50.00,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "startsAt": "2025-01-01T00:00:00",
  "expiresAt": "2025-12-31T23:59:59",
  "firstOrderOnly": false
}
```

**Beklenen Response (201 Created):**
```json
{
  "id": 1,
  "code": "YENI20",
  "description": "Yeni üyelere %20 indirim",
  "discountType": "PERCENTAGE",
  "discountValue": 20.00,
  "minimumOrderAmount": 100.00,
  "maximumDiscountAmount": 50.00,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "usedCount": 0,
  "startsAt": "2025-01-01T00:00:00",
  "expiresAt": "2025-12-31T23:59:59",
  "firstOrderOnly": false,
  "isActive": true,
  "isValid": true,
  "createdAt": "2025-01-15T10:00:00"
}
```

---

### Senaryo 2: Sabit Tu{
  "code": "KARGOBEDAVA",
  "description": "150 TL üzeri ücretsiz kargo",
  "discountType": "FREE_SHIPPING",
  "discountValue": 0.00,
  "minimumOrderAmount": 150.00,
  "usageLimit": 1000,
  "usageLimitPerUser": 1,
  "startsAt": "2025-01-01T00:00:00",
  "expiresAt": "2025-12-31T23:59:59"
}tar İndirim Kuponu Oluştur

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "code": "SABIT50",
  "description": "50 TL indirim kuponu",
  "discountType": "FIXED_AMOUNT",
  "discountValue": 50.00,
  "minimumOrderAmount": 200.00,
  "usageLimit": 500,
  "usageLimitPerUser": 2,
  "startsAt": "2025-01-01T00:00:00",
  "expiresAt": "2025-06-30T23:59:59"
}
```

---

### Senaryo 3: Ücretsiz Kargo Kuponu Oluştur

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json

```

---

### Senaryo 4: İlk Sipariş Kuponu Oluştur

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "code": "ILKSIPARIS30",
  "description": "İlk siparişe %30 indirim",
  "discountType": "PERCENTAGE",
  "discountValue": 30.00,
  "minimumOrderAmount": 100.00,
  "maximumDiscountAmount": 100.00,
  "usageLimit": null,
  "usageLimitPerUser": 1,
  "firstOrderOnly": true,
  "startsAt": "2025-01-01T00:00:00",
  "expiresAt": null
}
```

**Not:** `usageLimit: null` = sınırsız, `expiresAt: null` = süresiz

---

### Senaryo 5: Belirli Kategorilere Özel Kupon

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "code": "ELEKTRONIK15",
  "description": "Elektronik kategorisine %15 indirim",
  "discountType": "PERCENTAGE",
  "discountValue": 15.00,
  "minimumOrderAmount": 500.00,
  "applicableCategoryIds": [1, 2, 3],
  "usageLimit": 200,
  "usageLimitPerUser": 1
}
```

**Not:** `applicableCategoryIds` array'i kategori ID'lerini içerir.

---

### Senaryo 6: Belirli Ürünlere Özel Kupon

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "code": "OZELURUN25",
  "description": "Seçili ürünlere %25 indirim",
  "discountType": "PERCENTAGE",
  "discountValue": 25.00,
  "minimumOrderAmount": 0.00,
  "applicableProductIds": [1, 5, 10],
  "excludedProductIds": [2],
  "usageLimit": 100,
  "usageLimitPerUser": 1
}
```

---

### Senaryo 7: Tüm Kuponları Listele (Admin)

**Endpoint:** `GET /api/coupons`  
**Authorization:** Bearer Token (Admin)  
**Query Parameters:**
- `page`: 0 (varsayılan)
- `size`: 20 (varsayılan)
- `sort`: id,desc (opsiyonel)

**⚠️ ÖNEMLİ:** Swagger UI'da `sort` parametresini array formatında (`["id,desc"]`) göndermeyin! Spring Data Pageable için doğru format:

**Doğru URL Formatları:**

1. **Basit (varsayılan):**
   ```
   GET /api/coupons
   ```
   veya
   ```
   GET /api/coupons?page=0&size=20
   ```

2. **ID'ye göre azalan sıralama:**
   ```
   GET /api/coupons?page=0&size=20&sort=id,desc
   ```

3. **ID'ye göre artan sıralama:**
   ```
   GET /api/coupons?page=0&size=20&sort=id,asc
   ```

4. **Tarihe göre azalan:**
   ```
   GET /api/coupons?page=0&size=20&sort=createdAt,desc
   ```

5. **Çoklu sıralama:**
   ```
   GET /api/coupons?page=0&size=20&sort=createdAt,desc&sort=id,asc
   ```

**Tam cURL Örneği:**
```bash
curl -X 'GET' \
  'http://localhost:8080/api/coupons?page=0&size=20&sort=id,desc' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**⚠️ Swagger UI'da kullanım:**
- Swagger'da `sort` parametresini manuel olarak `id,desc` şeklinde yazın (array formatı kullanmayın)
- Ya da doğrudan URL'i browser'a yapıştırın

**Beklenen Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "code": "YENI20",
      "description": "Yeni üyelere %20 indirim",
      "discountType": "PERCENTAGE",
      ...
    }
  ],
  "pageable": {...},
  "totalElements": 10,
  "totalPages": 1
}
```

---

### Senaryo 8: Kupon Detayı Getir (Admin)

**Endpoint:** `GET /api/coupons/{id}`  
**Authorization:** Bearer Token (Admin)  
**Path Parameter:**
- `id`: 1

**URL:** `/api/coupons/1`

---

### Senaryo 9: Kuponu Güncelle (Admin)

**Endpoint:** `PUT /api/coupons/{id}`  
**Authorization:** Bearer Token (Admin)  
**Path Parameter:**
- `id`: 1

**Request Body:**
```json
{
  "description": "Güncellenmiş açıklama",
  "discountValue": 25.00,
  "minimumOrderAmount": 150.00,
  "isActive": true
}
```

**Not:** Sadece gönderilen alanlar güncellenir.

---

### Senaryo 10: Kuponu Deaktif Et (Admin)

**Endpoint:** `POST /api/coupons/{id}/deactivate`  
**Authorization:** Bearer Token (Admin)  
**Path Parameter:**
- `id`: 1

**Request Body:** Yok

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "code": "YENI20",
  "isActive": false,
  ...
}
```

---

### Senaryo 11: Kuponu Sil (Admin)

**Endpoint:** `DELETE /api/coupons/{id}`  
**Authorization:** Bearer Token (Admin)  
**Path Parameter:**
- `id`: 1

**Beklenen Response (200 OK):**
```json
{
  "message": "Kupon silindi"
}
```

---

## 🌐 PUBLIC - KUPON KULLANIMI

### Senaryo 12: Kupon Kodunu Doğrula

**Endpoint:** `GET /api/coupons/validate/{code}`  
**Authorization:** Gerekli değil (Public)

**Path Parameter:**
- `code`: YENI20

**URL:** `/api/coupons/validate/YENI20`

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "code": "YENI20",
  "description": "Yeni üyelere %20 indirim",
  "discountType": "PERCENTAGE",
  "discountValue": 20.00,
  "minimumOrderAmount": 100.00,
  "isValid": true,
  ...
}
```

---

### Senaryo 13: Geçerli Kuponları Listele

**Endpoint:** `GET /api/coupons/valid`  
**Authorization:** Gerekli değil (Public)

**Request Body:** Yok

**Beklenen Response (200 OK):**
```json
[
  {
    "id": 1,
    "code": "YENI20",
    "description": "Yeni üyelere %20 indirim",
    "discountType": "PERCENTAGE",
    "isValid": true,
    ...
  },
  {
    "id": 2,
    "code": "SABIT50",
    "description": "50 TL indirim kuponu",
    "discountType": "FIXED_AMOUNT",
    "isValid": true,
    ...
  }
]
```

---

### Senaryo 14: Kuponu Sepete Uygula

**Endpoint:** `POST /api/coupons/apply`  
**Authorization:** Bearer Token (User)

**Ön Koşul:** Kullanıcının aktif bir sepeti olmalı ve sepet toplamı minimum tutarı karşılamalı.

**Request Body:**
```json
{
  "code": "YENI20"
}
```

**Beklenen Response (200 OK):**
```json
{
  "success": true,
  "message": "Kupon başarıyla uygulandı",
  "couponCode": "YENI20",
  "discountType": "PERCENTAGE",
  "discountAmount": 20.00,
  "originalTotal": 100.00,
  "newTotal": 80.00
}
```

**Test Adımları:**
1. Önce sepete ürün ekle (Cart Service kullan)
2. Sepet toplamının minimum tutarı karşıladığından emin ol
3. Kuponu uygula

---

## 🛒 SİPARİŞ İLE KUPON ENTEGRASYONU

### Senaryo 15: Sipariş Oluştururken Kupon Kullan

**Endpoint:** `POST /api/orders`  
**Authorization:** Bearer Token (User)

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "variantId": 1,
      "quantity": 2
    },
    {
      "productId": 2,
      "variantId": 3,
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "addressLine": "Atatürk Caddesi No:123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Türkiye"
  },
  "billingAddress": {
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "addressLine": "Atatürk Caddesi No:123",
    "city": "İstanbul",
    "district": "Kadıköy",
    "postalCode": "34700",
    "country": "Türkiye"
  },
  "notes": "Kapıda ödeme",
  "couponCode": "YENI20"
}
```

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "orderNumber": "ORD-20250115-120000-ABC12345",
  "userId": 1,
  "userEmail": "user@example.com",
  "items": [...],
  "subtotal": 500.00,
  "tax": 100.00,
  "shippingCost": 29.99,
  "discountAmount": 100.00,
  "total": 529.99,
  "couponCode": "YENI20",
  "status": "PENDING",
  ...
}
```

**Not:** 
- `discountAmount` hesaplanmış indirim tutarı
- `couponCode` uygulanan kupon kodu
- `total` = subtotal + tax + shipping - discount

---

### Senaryo 16: Ücretsiz Kargo Kuponu ile Sipariş

**Endpoint:** `POST /api/orders`  
**Authorization:** Bearer Token (User)

**Request Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "variantId": 1,
      "quantity": 1
    }
  ],
  "shippingAddress": {...},
  "billingAddress": {...},
  "couponCode": "KARGOBEDAVA"
}
```

**Beklenen Response:**
```json
{
  "subtotal": 200.00,
  "tax": 40.00,
  "shippingCost": 0.00,
  "discountAmount": 0.00,
  "total": 240.00,
  "couponCode": "KARGOBEDAVA",
  ...
}
```

**Not:** `FREE_SHIPPING` kuponunda `shippingCost` 0 olur.

---

## ❌ HATA SENARYOLARI

### Senaryo 17: Geçersiz Kupon Kodu

**Endpoint:** `GET /api/coupons/validate/INVALID`  
**Authorization:** Gerekli değil

**Beklenen Response (404 Not Found):**
```json
{
  "code": "5027",
  "message": "Kupon bulunamadı",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

### Senaryo 18: Süresi Dolmuş Kupon

**Endpoint:** `POST /api/coupons/apply`  
**Authorization:** Bearer Token (User)

**Request Body:**
```json
{
  "code": "EXPIRED_COUPON"
}
```

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "5029",
  "message": "Kuponun süresi dolmuş",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

### Senaryo 19: Minimum Tutar Yetersiz

**Endpoint:** `POST /api/coupons/apply`  
**Authorization:** Bearer Token (User)

**Ön Koşul:** Sepet toplamı 50 TL, kupon minimum 100 TL istiyor.

**Request Body:**
```json
{
  "code": "YENI20"
}
```

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "5033",
  "message": "Minimum sipariş tutarına ulaşılmadı: Minimum sipariş tutarı: 100.00 TL",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

### Senaryo 20: Kullanım Limiti Dolmuş

**Endpoint:** `POST /api/coupons/apply`  
**Authorization:** Bearer Token (User)

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "5031",
  "message": "Kupon kullanım limiti dolmuş",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

### Senaryo 21: Kullanıcı Başına Limit Aşıldı

**Endpoint:** `POST /api/coupons/apply`  
**Authorization:** Bearer Token (User)

**Ön Koşul:** Kullanıcı bu kuponu zaten `usageLimitPerUser` kadar kullanmış.

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "5032",
  "message": "Bu kuponu daha fazla kullanamazsınız",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

### Senaryo 22: İlk Sipariş Kuponu - Daha Önce Sipariş Vermiş

**Endpoint:** `POST /api/coupons/apply`  
**Authorization:** Bearer Token (User)

**Ön Koşul:** Kullanıcının daha önce siparişi var.

**Request Body:**
```json
{
  "code": "ILKSIPARIS30"
}
```

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "5034",
  "message": "Bu kupon sadece ilk sipariş için geçerli",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

### Senaryo 23: Aynı Kupon Kodunu Tekrar Oluşturma

**Endpoint:** `POST /api/coupons`  
**Authorization:** Bearer Token (Admin)

**Request Body:**
```json
{
  "code": "YENI20",
  "discountType": "PERCENTAGE",
  "discountValue": 15.00
}
```

**Beklenen Response (409 Conflict):**
```json
{
  "code": "5028",
  "message": "Bu kupon kodu zaten mevcut",
  "timestamp": "2025-01-15T10:00:00"
}
```

---

## 🧪 TEST SIRASI ÖNERİSİ

### 1. Admin Testleri
1. Senaryo 1: Yüzdelik kupon oluştur
2. Senaryo 2: Sabit tutar kuponu oluştur
3. Senaryo 3: Ücretsiz kargo kuponu oluştur
4. Senaryo 7: Tüm kuponları listele
5. Senaryo 8: Kupon detayı getir
6. Senaryo 9: Kuponu güncelle
7. Senaryo 10: Kuponu deaktif et

### 2. Public Testleri
1. Senaryo 12: Kupon kodunu doğrula
2. Senaryo 13: Geçerli kuponları listele
3. Senaryo 14: Kuponu sepete uygula

### 3. Entegrasyon Testleri
1. Senaryo 15: Sipariş oluştururken kupon kullan
2. Senaryo 16: Ücretsiz kargo kuponu ile sipariş

### 4. Hata Testleri
1. Senaryo 17: Geçersiz kupon kodu
2. Senaryo 19: Minimum tutar yetersiz
3. Senaryo 23: Aynı kupon kodunu tekrar oluşturma

---

## 📊 BAŞARILI TEST KONTROL LİSTESİ

- [ ] Admin kupon oluşturabiliyor
- [ ] Admin kuponları listeleyebiliyor
- [ ] Admin kuponu güncelleyebiliyor
- [ ] Admin kuponu deaktif edebiliyor
- [ ] Public kupon kodunu doğrulayabiliyor
- [ ] Public geçerli kuponları listeleyebiliyor
- [ ] Kullanıcı kuponu sepete uygulayabiliyor
- [ ] Sipariş oluştururken kupon kullanılabiliyor
- [ ] Ücretsiz kargo kuponu çalışıyor
- [ ] Minimum tutar kontrolü çalışıyor
- [ ] Kullanım limiti kontrolü çalışıyor
- [ ] İlk sipariş kontrolü çalışıyor
- [ ] Hata mesajları doğru dönüyor

---

## 💡 İPUÇLARI

1. **Token Yönetimi:** Her test öncesi token'ın geçerli olduğundan emin ol
2. **Sepet Hazırlığı:** Sepet testleri için önce ürün ekle
3. **ID'ler:** Gerçek productId, variantId, categoryId kullan
4. **Tarihler:** `expiresAt` geçmiş tarih olursa kupon geçersiz olur
5. **Minimum Tutar:** Sepet toplamı minimum tutarı karşılamalı
6. **Stok Kontrolü:** Sipariş testlerinde stok yeterli olmalı

---

## 🔍 DEBUG İÇİN LOG KONTROLÜ

Test sırasında console'da şu log'ları görebilirsiniz:
- `Coupon created: YENI20`
- `Coupon {} applied to cart. Discount: {}`
- `Coupon {} applied to order {}. Discount: {}`

Bu log'lar işlemlerin başarılı olduğunu gösterir.

---

## 📊 TEST SONUÇLARI RAPORU (20 Aralık 2025)

### ✅ BAŞARILI TESTLER

| Senaryo | Test Adı | Durum | Notlar |
|---------|----------|-------|--------|
| Senaryo 1 | Yüzdelik İndirim Kuponu (YENI20) | ✅ Başarılı | 201 Created, tüm alanlar doğru |
| Senaryo 2 | Sabit Tutar Kuponu (SABIT50) | ⚠️ Kısmen | 201 Created ama `isValid: false` dönmüş (tarih kontrolü gerekebilir) |
| Senaryo 4 | İlk Sipariş Kuponu (ILKSIPARIS30) | ✅ Başarılı | 201 Created, null değerler destekleniyor |
| Senaryo 5 | Kategorilere Özel Kupon (ELEKTRONIK15) | ✅ Başarılı | 201 Created, applicableCategoryIds çalışıyor |
| Senaryo 6 | Ürünlere Özel Kupon (OZELURUN25) | ✅ Başarılı | 201 Created, applicableProductIds çalışıyor |
| Senaryo 13 | Geçerli Kuponları Listele | ✅ Başarılı | 200 OK, 5 kupon döndü |
| Senaryo 14 | Kuponu Sepete Uygula | ✅ Başarılı | 200 OK, indirim hesaplaması doğru |

### ❌ SORUNLU TESTLER

| Senaryo | Test Adı | Durum | Hata | Çözüm Durumu |
|---------|----------|-------|------|--------------|
| Senaryo 3 | Ücretsiz Kargo Kuponu (KARGOBEDAVA) | ❌ Başarısız | 400: "discountValue İndirim değeri 0'dan büyük olmalı" | ✅ Düzeltildi |
| Senaryo 7 | Tüm Kuponları Listele (Admin) | ❌ Başarısız | 500: "Sunucu hatası oluştu" | 🔍 İnceleniyor |
| Senaryo 15 | Sipariş Oluştururken Kupon | ❌ Başarısız | 404: "Ürün varyantı bulunamadı" | ⚠️ Test verisi sorunu |
| Senaryo 16 | Ücretsiz Kargo ile Sipariş | ❌ Başarısız | 500: "Sunucu hatası oluştu" | 🔍 İnceleniyor |

### 🔧 YAPILAN DÜZELTMELER

1. **FREE_SHIPPING için discountValue validasyonu düzeltildi**
   - `CouponCreateRequest` içindeki `@DecimalMin(value = "0.01")` kuralı `@DecimalMin(value = "0")` olarak değiştirildi
   - `CouponService.createCoupon()` metodunda FREE_SHIPPING için özel kontrol eklendi
   - FREE_SHIPPING kuponlarında discountValue 0.00 olabilir

### 📝 NOTLAR VE GÖZLEMLER

1. **Senaryo 2 (SABIT50)**: Kupon başarıyla oluşturuldu ancak `isValid: false` dönmüş. Bu muhtemelen:
   - `expiresAt: "2025-06-30T23:59:59"` tarihinin şu anki tarihe göre kontrol edilmesinden kaynaklanıyor olabilir
   - Veya başka bir validasyon kontrolü var

2. **Senaryo 7 (GET /api/coupons)**: 500 hatası alındı. Muhtemel nedenler:
   - Lazy loading sorunu
   - `mapToDto` metodunda bir exception
   - Database bağlantı sorunu

3. **Senaryo 15-16 (Sipariş Testleri)**: 
   - Senaryo 15: Test verisi sorunu (variantId bulunamadı) - gerçek productId/variantId kullanılmalı
   - Senaryo 16: 500 hatası - OrderService'de FREE_SHIPPING işlemi sırasında sorun olabilir

4. **Çalışan Özellikler**:
   - ✅ Kupon oluşturma (çeşitli tipler)
   - ✅ Geçerli kuponları listeleme
   - ✅ Kuponu sepete uygulama
   - ✅ İndirim hesaplamaları
   - ✅ Null değer desteği (usageLimit, expiresAt)

### 🎯 SONRAKI ADIMLAR

1. Senaryo 7 (GET /api/coupons) için log kontrolü ve hata ayıklama
2. Senaryo 16 (Ücretsiz Kargo ile Sipariş) için OrderService kontrolü
3. Senaryo 15 için gerçek test verileri kullanılması
4. Senaryo 2'deki `isValid: false` durumunun araştırılması

