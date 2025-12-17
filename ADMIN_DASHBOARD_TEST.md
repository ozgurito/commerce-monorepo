# 🧪 ADMIN DASHBOARD TEST SENARYOLARI

## 📋 İÇİNDEKİLER
1. [Swagger UI Test Adımları](#swagger-ui-test-adımları)
2. [Postman/cURL Test Örnekleri](#postmancurl-test-örnekleri)
3. [Test Senaryoları](#test-senaryoları)
4. [Beklenen Sonuçlar](#beklenen-sonuçlar)

---

## 🔐 ÖN HAZIRLIK: ADMIN TOKEN ALMA

### 1. ADMIN Kullanıcısı ile Giriş Yap

**Swagger UI'da:**
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "admin@local",
  "password": "changeme"
}
```

**Veya yeni bir ADMIN kullanıcısı oluştur:**
```json
{
  "email": "admin@test.com",
  "password": "admin123",
  "fullName": "Admin User"
}
```

**Response'dan `token` değerini kopyala:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "...",
  "userId": 1,
  "email": "admin@local",
  "fullName": "Admin User"
}
```

### 2. Swagger'da Authorization Ayarla

1. Swagger UI'da sağ üstteki **"Authorize"** butonuna tıkla
2. **"Value"** alanına: `Bearer {token}` yaz
   - Örnek: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **"Authorize"** butonuna tıkla
4. **"Close"** ile kapat

---

## 📊 TEST 1: DASHBOARD STATS ENDPOINT

### Swagger UI Test

**Endpoint:** `GET /api/admin/stats`

**Adımlar:**
1. Swagger UI'da `/api/admin/stats` endpoint'ini bul
2. **"Try it out"** butonuna tıkla
3. **"Execute"** butonuna tıkla

**Beklenen Response (200 OK):**
```json
{
  "totalOrders": 15,
  "pendingOrders": 3,
  "processingOrders": 5,
  "completedOrders": 7,
  "totalProducts": 50,
  "activeProducts": 45,
  "lowStockProducts": 8,
  "totalUsers": 25,
  "totalReviews": 30,
  "pendingReviews": 5,
  "totalRevenue": 12500.50,
  "averageOrderValue": 833.37
}
```

### cURL Test

```bash
curl -X GET "http://localhost:8080/api/admin/stats" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Postman Test

- **Method:** GET
- **URL:** `http://localhost:8080/api/admin/stats`
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - `Content-Type: application/json`

---

## 📦 TEST 2: GET ALL ORDERS

### Swagger UI Test - ADIM ADIM

**Endpoint:** `GET /api/admin/orders`

#### 🔹 ADIM 1: Endpoint'i Aç
1. Swagger UI'da `/api/admin/orders` endpoint'ini bul
2. **"Try it out"** butonuna tıkla

#### 🔹 ADIM 2: Query Parametrelerini Doldur

Swagger'da **"Parameters"** bölümünde şu alanlar görünecek:

**1. `status` Parametresi (Opsiyonel - Boş bırakılabilir)**
   - **Açıklama:** Sipariş durumuna göre filtreleme
   - **Değerler:** 
     - `PENDING` - Bekleyen siparişler
     - `PAID` - Ödenmiş siparişler
     - `PROCESSING` - İşleniyor
     - `SHIPPED` - Kargoya verildi
     - `DELIVERED` - Teslim edildi
     - `CANCELLED` - İptal edildi
     - `REFUNDED` - İade edildi
   - **Nasıl Doldurulur:**
     - Input alanına direkt yaz: `PENDING` veya dropdown'dan seç
     - **Tüm siparişler için:** Boş bırak (hiçbir şey yazma)

**2. `pageable` Parametresi (Opsiyonel)**
   - **Açıklama:** Sayfalama ayarları
   - **Varsayılan:** `page: 0, size: 20, sort: ["createdAt,desc"]`
   - **Nasıl Doldurulur:**
     - Swagger'da genellikle otomatik doldurulur
     - Manuel değiştirmek için:
       ```json
       {
         "page": 0,
         "size": 20,
         "sort": ["createdAt,desc"]
       }
       ```
     - **Veya basit parametreler kullan:**
       - `page`: 0, 1, 2, ...
       - `size`: 10, 20, 50, ...
       - `sort`: `createdAt,desc` veya `createdAt,asc`

#### 🔹 ADIM 3: Test Senaryoları

**📌 Senaryo A: TÜM SİPARİŞLER (Status Filtresi YOK)**
```
1. status alanını BOŞ BIRAK (hiçbir şey yazma)
2. pageable varsayılan değerlerle kalsın
3. "Execute" butonuna tıkla
```
**Sonuç:** Tüm siparişler döner

---

**📌 Senaryo B: SADECE PENDING SİPARİŞLER**
```
1. status alanına: PENDING yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece PENDING durumundaki siparişler döner

---

**📌 Senaryo C: SADECE DELIVERED SİPARİŞLER**
```
1. status alanına: DELIVERED yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece DELIVERED durumundaki siparişler döner

---

**📌 Senaryo D: SADECE PROCESSING SİPARİŞLER**
```
1. status alanına: PROCESSING yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece PROCESSING durumundaki siparişler döner

---

**📌 Senaryo E: SADECE PAID SİPARİŞLER**
```
1. status alanına: PAID yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece PAID durumundaki siparişler döner

---

**📌 Senaryo F: SADECE SHIPPED SİPARİŞLER**
```
1. status alanına: SHIPPED yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece SHIPPED durumundaki siparişler döner

---

**📌 Senaryo G: SADECE CANCELLED SİPARİŞLER**
```
1. status alanına: CANCELLED yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece CANCELLED durumundaki siparişler döner

---

**📌 Senaryo H: SADECE REFUNDED SİPARİŞLER**
```
1. status alanına: REFUNDED yaz
2. "Execute" butonuna tıkla
```
**Sonuç:** Sadece REFUNDED durumundaki siparişler döner

---

**📌 Senaryo I: SAYFALAMA İLE (İlk 10 Sipariş)**
```
1. status alanını BOŞ BIRAK
2. pageable bölümünde:
   - page: 0
   - size: 10
   - sort: BOŞ BIRAK veya varsayılan değerleri kullan
3. "Execute" butonuna tıkla
```
**Sonuç:** İlk 10 sipariş döner (varsayılan olarak createdAt,desc ile sıralanır)

---

**📌 Senaryo J: SAYFALAMA + STATUS FİLTRESİ**
```
1. status alanına: PENDING yaz
2. pageable bölümünde:
   - page: 0
   - size: 5
   - sort: BOŞ BIRAK (varsayılan createdAt,desc kullanılır)
3. "Execute" butonuna tıkla
```
**Sonuç:** İlk 5 PENDING sipariş döner

---

### ⚠️ ÖNEMLİ: SORT PARAMETRESİ

**Swagger'da sort parametresi sorun çıkarabilir!**

**Çözüm:**
- `sort` alanını **BOŞ BIRAK** (hiçbir şey yazma)
- Varsayılan olarak `createdAt,desc` kullanılacak
- Eğer sort alanına bir şey yazarsan, Swagger yanlış format gönderebilir

**Doğru Format (Manuel URL'de):**
```
GET /api/admin/orders?status=PENDING&page=0&size=20&sort=createdAt,desc
```

**Yanlış Format (Swagger'dan gelen):**
```
GET /api/admin/orders?status=PENDING&page=0&size=20&sort=["createdAt,desc"]
```

---

### 📸 Swagger UI Görsel Rehber

```
┌─────────────────────────────────────────────────┐
│ GET /api/admin/orders                          │
├─────────────────────────────────────────────────┤
│ [Try it out]                                    │
├─────────────────────────────────────────────────┤
│ Parameters:                                     │
│                                                 │
│ status: [PENDING        ▼]  ← Buraya yaz!      │
│          (string, optional)                     │
│                                                 │
│ pageable: [▼]  ← Genelde otomatik              │
│            {                                    │
│              "page": 0,                        │
│              "size": 20,                       │
│              "sort": ["createdAt,desc"]        │
│            }                                    │
│                                                 │
│ [Execute]  ← Tıkla!                            │
└─────────────────────────────────────────────────┘
```

### ⚠️ ÖNEMLİ NOTLAR

1. **Body YOK!** Bu endpoint'te body göndermiyoruz, sadece query parametreleri kullanıyoruz.

2. **Status Parametresi:**
   - Büyük/küçük harf duyarlı: `PENDING` ✅, `pending` ❌
   - Geçerli değerler: `PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `REFUNDED`
   - Tüm siparişler için: Boş bırak

3. **Authorization:**
   - Mutlaka önce **"Authorize"** butonuna tıklayıp token'ı ekle
   - Token formatı: `Bearer {token}`

4. **Hata Durumları:**
   - 403 Forbidden → Token yok veya kullanıcı ADMIN değil
   - 401 Unauthorized → Token geçersiz veya süresi dolmuş

**Beklenen Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "orderNumber": "ORD-20241201-123456",
      "userId": 5,
      "userEmail": "user@example.com",
      "items": [
        {
          "id": 1,
          "productId": 10,
          "productName": "Ürün Adı",
          "quantity": 2,
          "unitPrice": 99.99,
          "totalPrice": 199.98
        }
      ],
      "subtotal": 199.98,
      "tax": 20.00,
      "shippingCost": 15.00,
      "total": 234.98,
      "status": "PENDING",
      "shippingAddress": {
        "street": "Test Sokak",
        "city": "İstanbul",
        "postalCode": "34000",
        "country": "Türkiye"
      },
      "billingAddress": {
        "street": "Test Sokak",
        "city": "İstanbul",
        "postalCode": "34000",
        "country": "Türkiye"
      },
      "createdAt": "2024-12-01T10:30:00",
      "updatedAt": "2024-12-01T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false
    }
  },
  "totalElements": 15,
  "totalPages": 1,
  "last": true,
  "size": 20,
  "number": 0,
  "first": true,
  "numberOfElements": 15,
  "empty": false
}
```

### cURL Test

```bash
# Tüm siparişler
curl -X GET "http://localhost:8080/api/admin/orders" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"

# Sadece PENDING siparişler
curl -X GET "http://localhost:8080/api/admin/orders?status=PENDING" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"

# Sayfalama ile
curl -X GET "http://localhost:8080/api/admin/orders?page=0&size=10&sort=createdAt,desc" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

### Postman Test

- **Method:** GET
- **URL:** `http://localhost:8080/api/admin/orders`
- **Query Params (Opsiyonel):**
  - `status`: PENDING
  - `page`: 0
  - `size`: 20
  - `sort`: createdAt,desc
- **Headers:**
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - `Content-Type: application/json`

---

## 🧪 TEST SENARYOLARI

### Senaryo 1: Dashboard Stats - Başarılı

**Amaç:** Dashboard istatistiklerini başarıyla almak

**Adımlar:**
1. ✅ ADMIN token ile giriş yap
2. ✅ `GET /api/admin/stats` endpoint'ini çağır
3. ✅ Response'u kontrol et

**Beklenen:**
- ✅ Status Code: 200 OK
- ✅ Response'da tüm istatistik alanları mevcut
- ✅ Sayısal değerler >= 0
- ✅ `totalRevenue` ve `averageOrderValue` BigDecimal formatında

---

### Senaryo 2: Dashboard Stats - Boş Veri

**Amaç:** Hiç veri yokken dashboard stats'ın boş değerler döndürmesi

**Adımlar:**
1. ✅ Yeni bir veritabanı veya temiz veritabanı kullan
2. ✅ ADMIN token ile giriş yap
3. ✅ `GET /api/admin/stats` endpoint'ini çağır

**Beklenen:**
- ✅ Status Code: 200 OK
- ✅ Tüm sayısal değerler 0
- ✅ `totalRevenue` ve `averageOrderValue` 0.00

---

### Senaryo 3: Get All Orders - Başarılı

**Amaç:** Tüm siparişleri sayfalama ile almak

**Adımlar:**
1. ✅ ADMIN token ile giriş yap
2. ✅ `GET /api/admin/orders` endpoint'ini çağır
3. ✅ Response'u kontrol et

**Beklenen:**
- ✅ Status Code: 200 OK
- ✅ Page yapısı doğru (content, totalElements, totalPages, vb.)
- ✅ Her order'da gerekli alanlar mevcut
- ✅ Order items doğru map edilmiş

---

### Senaryo 4: Get Orders by Status - PENDING

**Amaç:** Sadece PENDING durumundaki siparişleri almak

**Adımlar:**
1. ✅ ADMIN token ile giriş yap
2. ✅ `GET /api/admin/orders?status=PENDING` endpoint'ini çağır
3. ✅ Response'u kontrol et

**Beklenen:**
- ✅ Status Code: 200 OK
- ✅ Tüm dönen siparişlerin status'u PENDING
- ✅ Sayfalama çalışıyor

---

### Senaryo 5: Get Orders by Status - DELIVERED

**Amaç:** Sadece DELIVERED durumundaki siparişleri almak

**Adımlar:**
1. ✅ ADMIN token ile giriş yap
2. ✅ `GET /api/admin/orders?status=DELIVERED` endpoint'ini çağır

**Beklenen:**
- ✅ Status Code: 200 OK
- ✅ Tüm dönen siparişlerin status'u DELIVERED

---

### Senaryo 6: Get Orders - Sayfalama

**Amaç:** Sayfalama parametrelerinin doğru çalışması

**Adımlar:**
1. ✅ ADMIN token ile giriş yap
2. ✅ `GET /api/admin/orders?page=0&size=5` endpoint'ini çağır
3. ✅ `GET /api/admin/orders?page=1&size=5` endpoint'ini çağır

**Beklenen:**
- ✅ İlk sayfada 5 kayıt
- ✅ İkinci sayfada farklı 5 kayıt
- ✅ `pageable` bilgileri doğru

---

### Senaryo 7: Unauthorized Access - Token Yok

**Amaç:** Token olmadan erişimin engellenmesi

**Adımlar:**
1. ❌ Token göndermeden `GET /api/admin/stats` çağır

**Beklenen:**
- ❌ Status Code: 401 Unauthorized veya 403 Forbidden
- ❌ Hata mesajı döner

---

### Senaryo 8: Unauthorized Access - USER Role

**Amaç:** USER role'ü ile erişimin engellenmesi

**Adımlar:**
1. ✅ Normal USER token ile giriş yap
2. ❌ `GET /api/admin/stats` endpoint'ini çağır

**Beklenen:**
- ❌ Status Code: 403 Forbidden
- ❌ "Access Denied" hatası

---

### Senaryo 9: Rate Limiting

**Amaç:** Rate limit'in çalışması

**Adımlar:**
1. ✅ ADMIN token ile giriş yap
2. ✅ `GET /api/admin/stats` endpoint'ini 25 kez hızlıca çağır (limit: 20/dakika)

**Beklenen:**
- ✅ İlk 20 istek başarılı
- ❌ 21. istekten itibaren 429 Too Many Requests veya rate limit hatası

---

### Senaryo 10: Order Items - Silinmiş Ürün

**Amaç:** Silinmiş ürünlerin "Silinmiş Ürün" olarak gösterilmesi

**Adımlar:**
1. ✅ Bir sipariş oluştur
2. ✅ Siparişteki ürünü sil
3. ✅ ADMIN token ile `GET /api/admin/orders` çağır

**Beklenen:**
- ✅ Status Code: 200 OK
- ✅ Order item'da `productName: "Silinmiş Ürün"` gösterilir
- ✅ `productId` null olabilir

---

## 📝 MANUEL TEST CHECKLIST

### Dashboard Stats Endpoint
- [ ] ADMIN token ile başarılı çağrı
- [ ] Response'da tüm alanlar mevcut
- [ ] Sayısal değerler doğru hesaplanmış
- [ ] Boş veritabanında boş değerler dönüyor
- [ ] USER role ile erişim engellenmiş
- [ ] Token olmadan erişim engellenmiş

### Orders Endpoint
- [ ] ADMIN token ile başarılı çağrı
- [ ] Tüm siparişler dönüyor
- [ ] Status filtresi çalışıyor (PENDING, DELIVERED, vb.)
- [ ] Sayfalama çalışıyor (page, size, sort)
- [ ] Order items doğru map edilmiş
- [ ] Silinmiş ürünler "Silinmiş Ürün" olarak gösteriliyor
- [ ] USER role ile erişim engellenmiş
- [ ] Token olmadan erişim engellenmiş

---

## 🔧 HIZLI TEST KOMUTLARI

### PowerShell ile Token Alma ve Test

```powershell
# 1. Token al
$loginBody = @{
    email = "admin@local"
    password = "changeme"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $response.token
Write-Host "Token: $token"

# 2. Dashboard Stats Test
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$stats = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/stats" `
    -Method GET `
    -Headers $headers

Write-Host "Dashboard Stats:"
$stats | ConvertTo-Json -Depth 10

# 3. Orders Test
$orders = Invoke-RestMethod -Uri "http://localhost:8080/api/admin/orders" `
    -Method GET `
    -Headers $headers

Write-Host "Orders:"
$orders | ConvertTo-Json -Depth 10
```

---

## 🐛 HATA AYIKLAMA

### 403 Forbidden Hatası
- ✅ Token'ın doğru gönderildiğinden emin ol: `Bearer {token}`
- ✅ Kullanıcının ADMIN role'üne sahip olduğunu kontrol et
- ✅ Token'ın süresinin dolmadığını kontrol et

### 401 Unauthorized Hatası
- ✅ Token'ın geçerli olduğunu kontrol et
- ✅ Token formatının doğru olduğunu kontrol et: `Bearer {token}`

### 500 Internal Server Error
- ✅ Veritabanı bağlantısını kontrol et
- ✅ Repository metodlarının doğru çalıştığını kontrol et
- ✅ Log dosyalarını incele

### Boş Response
- ✅ Veritabanında veri olduğunu kontrol et
- ✅ Repository metodlarının doğru çalıştığını kontrol et

---

## ✅ BAŞARILI TEST KRİTERLERİ

1. ✅ Tüm endpoint'ler ADMIN token ile çalışıyor
2. ✅ USER role ile erişim engellenmiş
3. ✅ Token olmadan erişim engellenmiş
4. ✅ Dashboard stats doğru hesaplanıyor
5. ✅ Orders listesi doğru dönüyor
6. ✅ Status filtresi çalışıyor
7. ✅ Sayfalama çalışıyor
8. ✅ Rate limiting çalışıyor
9. ✅ Silinmiş ürünler doğru gösteriliyor

---

## 📞 TEST SONUÇLARI

Test sonuçlarını buraya not edebilirsiniz:

- [ ] Test 1: Dashboard Stats - ✅/❌
- [ ] Test 2: Get All Orders - ✅/❌
- [ ] Test 3: Get Orders by Status - ✅/❌
- [ ] Test 4: Unauthorized Access - ✅/❌
- [ ] Test 5: Rate Limiting - ✅/❌

**Notlar:**
```
Buraya test sırasında karşılaştığınız sorunları veya gözlemlerinizi yazabilirsiniz.
```

