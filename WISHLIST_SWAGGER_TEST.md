# ❤️ Wishlist (Favoriler) - Swagger Test Rehberi

Swagger'dan direkt kopyalayıp kullanabileceğiniz hazır test senaryoları ve request body'leri.

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

## 📋 ENDPOINT TESTLERİ

### ✅ TEST 1: Favori Sayısını Al (Boş Wishlist)

**Method:** `GET`  
**Endpoint:** `/api/wishlist/count`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist/count` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "count": 0
}
```

---

### ✅ TEST 2: Ürün Favorilerde Mi? (Kontrol - False)

**Method:** `GET`  
**Endpoint:** `/api/wishlist/check/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `1`

**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist/check/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `1` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "inWishlist": false
}
```

**Alternatif Test:**
- `productId: 2`
- `productId: 10`
- `productId: 15`

---

### ✅ TEST 3: Favorilere Ürün Ekle

**Method:** `POST`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `1`

**Query Parameters:** Yok  
**Request Body:** ❌ Yok (Path variable yeterli)  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `POST /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `1` yazın
4. Request body'yi boş bırakın (body gerekmez)
5. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Ürün Adı",
  "productSlug": "urun-adi",
  "productPrice": 99.99,
  "productImageUrl": "https://example.com/image.jpg",
  "inStock": true,
  "addedAt": "2024-01-15T10:30:00"
}
```

**Alternatif Test:**
- `productId: 2` → İkinci ürün ekle
- `productId: 10` → Üçüncü ürün ekle

---

### ✅ TEST 4: Aynı Ürünü Tekrar Ekleme (Idempotent Test)

**Method:** `POST`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `1` (TEST 3'te eklenen ürün)

**Query Parameters:** Yok  
**Request Body:** ❌ Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `POST /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `1` yazın (zaten ekli)
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "productId": 1,
  "productName": "Ürün Adı",
  "productSlug": "urun-adi",
  "productPrice": 99.99,
  "productImageUrl": "https://example.com/image.jpg",
  "inStock": true,
  "addedAt": "2024-01-15T10:30:00"
}
```

**Not:** Hata vermez, mevcut item döner (idempotent davranış).

---

### ✅ TEST 5: Ürün Favorilerde Mi? (True Kontrolü)

**Method:** `GET`  
**Endpoint:** `/api/wishlist/check/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `1` (TEST 3'te eklenen ürün)

**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist/check/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `1` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "inWishlist": true
}
```

---

### ✅ TEST 6: Favori Sayısını Kontrol Et (Güncel)

**Method:** `GET`  
**Endpoint:** `/api/wishlist/count`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist/count` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "count": 3
}
```

**Not:** TEST 3'te 3 ürün eklendi (1, 2, 10) → count: 3

---

### ✅ TEST 7: Favorileri Listele (Sayfalı)

**Method:** `GET`  
**Endpoint:** `/api/wishlist`  
**Path Parameters:** Yok  
**Query Parameters (Opsiyonel):**
- `page` (Integer, optional): `0` (varsayılan: 0)
- `size` (Integer, optional): `20` (varsayılan: 20)
- `sort` (String, optional): `createdAt,desc` (varsayılan: createdAt,desc)

**⚠️ ÖNEMLİ:** Swagger'da `sort` parametresini **string olarak** gönderin, array değil!
- ❌ **Yanlış:** `sort=["createdAt,desc"]` (array formatı)
- ✅ **Doğru:** `sort=createdAt,desc` (string formatı)

**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test (Varsayılan Parametrelerle - ÖNERİLEN):**
1. `GET /api/wishlist` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. Query parametrelerini **boş bırakın** (varsayılanlar kullanılır: page=0, size=20, sort=createdAt,desc)
4. "Execute" butonuna tıklayın

**Veya Özel Parametrelerle:**
1. `GET /api/wishlist` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. Query parametrelerini doldurun:
   - `page`: `0`
   - `size`: `20`
   - `sort`: `createdAt,desc` ⚠️ **String olarak, virgülle ayrılmış!**
4. "Execute" butonuna tıklayın

**Alternatif (Manuel URL):**
```
GET /api/wishlist?page=0&size=20&sort=createdAt,desc
```

**Beklenen Response (200 OK):**
```json
{
  "content": [
    {
      "id": 3,
      "productId": 10,
      "productName": "Ürün 10",
      "productSlug": "urun-10",
      "productPrice": 149.99,
      "productImageUrl": "https://example.com/image10.jpg",
      "inStock": true,
      "addedAt": "2024-01-15T10:35:00"
    },
    {
      "id": 2,
      "productId": 2,
      "productName": "Ürün 2",
      "productSlug": "urun-2",
      "productPrice": 79.99,
      "productImageUrl": "https://example.com/image2.jpg",
      "inStock": true,
      "addedAt": "2024-01-15T10:32:00"
    },
    {
      "id": 1,
      "productId": 1,
      "productName": "Ürün 1",
      "productSlug": "urun-1",
      "productPrice": 99.99,
      "productImageUrl": "https://example.com/image1.jpg",
      "inStock": true,
      "addedAt": "2024-01-15T10:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "unsorted": false,
      "empty": false
    }
  },
  "totalElements": 3,
  "totalPages": 1,
  "last": true,
  "size": 20,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false,
    "empty": false
  },
  "numberOfElements": 3,
  "first": true,
  "empty": false
}
```

**Alternatif Query Parametreleri:**

**Küçük sayfa boyutu:**
- `page`: `0`
- `size`: `5`
- `sort`: `createdAt,desc` ⚠️ String formatında!

**Farklı sıralama (En eski önce):**
- `page`: `0`
- `size`: `20`
- `sort`: `createdAt,asc` ⚠️ String formatında!

**İkinci sayfa:**
- `page`: `1`
- `size`: `10`
- `sort`: `createdAt,desc` ⚠️ String formatında!

---

### ✅ TEST 8: Favorilerden Ürün Çıkar

**Method:** `DELETE`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `2`

**Query Parameters:** Yok  
**Request Body:** ❌ Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `DELETE /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `2` yazın
4. Request body'yi boş bırakın (body gerekmez)
5. "Execute" butonuna tıklayın

**Beklenen Response (204 No Content):**
```
(Body yok, sadece 204 status code)
```

---

### ✅ TEST 9: Silinen Ürünü Kontrol Et

**Method:** `GET`  
**Endpoint:** `/api/wishlist/check/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `2` (TEST 8'de silinen ürün)

**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist/check/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `2` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "inWishlist": false
}
```

---

### ✅ TEST 10: Güncel Favori Sayısı

**Method:** `GET`  
**Endpoint:** `/api/wishlist/count`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist/count` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "count": 2
}
```

**Not:** TEST 8'de 1 ürün silindi → 3'ten 2'ye düştü

---

### ✅ TEST 11: Güncel Favori Listesi

**Method:** `GET`  
**Endpoint:** `/api/wishlist`  
**Path Parameters:** Yok  
**Query Parameters:**
- `page`: `0`
- `size`: `20`
- `sort`: `createdAt`
- `direction`: `DESC`

**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. Query parametrelerini doldurun (veya varsayılanları kullanın)
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "content": [
    {
      "id": 3,
      "productId": 10,
      "productName": "Ürün 10",
      ...
    },
    {
      "id": 1,
      "productId": 1,
      "productName": "Ürün 1",
      ...
    }
  ],
  "totalElements": 2,
  ...
}
```

**Not:** productId: 2 silindi, listede yok

---

### ✅ TEST 12: Olmayan Ürünü Silme (Idempotent)

**Method:** `DELETE`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `999` (olmayan ürün)

**Query Parameters:** Yok  
**Request Body:** ❌ Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `DELETE /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `999` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (204 No Content):**
```
(Body yok, hata vermez - idempotent)
```

---

### ✅ TEST 13: Olmayan Ürünü Ekleme (Hata)

**Method:** `POST`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `999` (veritabanında olmayan ürün)

**Query Parameters:** Yok  
**Request Body:** ❌ Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `POST /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `999` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (404 NOT_FOUND):**
```json
{
  "code": "5001",
  "message": "Ürün bulunamadı",
  "status": "NOT_FOUND"
}
```

---

## 🔄 TAM TEST AKIŞI (SIRALI)

Aşağıdaki adımları sırayla takip edin:

**1. Token Al:**
```
POST /api/auth/login
Body: {"email": "test@example.com", "password": "password123"}
→ Token kopyala
```

**2. Authorize (Swagger):**
```
Sağ üstte "Authorize" → Bearer <token> yapıştır
```

**3. Boş Kontrol:**
```
GET /api/wishlist/count
→ {"count": 0}
```

**4. Ürün Kontrol (False):**
```
GET /api/wishlist/check/1
→ {"inWishlist": false}
```

**5. Ürün Ekle:**
```
POST /api/wishlist/1
(Body yok, sadece path variable)
→ WishlistItemDto döner (200 OK)
```

**6. Tekrar Ekle (Idempotent):**
```
POST /api/wishlist/1
→ Aynı item döner (hata yok)
```

**7. Kontrol Et (True):**
```
GET /api/wishlist/check/1
→ {"inWishlist": true}
```

**8. Sayı Kontrol:**
```
GET /api/wishlist/count
→ {"count": 1}
```

**9. Listele:**
```
GET /api/wishlist?page=0&size=20&sort=createdAt,desc
→ 1 ürün içeren liste
```

**10. Başka Ürün Ekle:**
```
POST /api/wishlist/2
POST /api/wishlist/10
```

**11. Sayı Kontrol:**
```
GET /api/wishlist/count
→ {"count": 3}
```

**12. Listele:**
```
GET /api/wishlist?page=0&size=20
→ 3 ürün içeren liste
```

**13. Ürün Sil:**
```
DELETE /api/wishlist/2
(Body yok, sadece path variable)
→ 204 No Content
```

**14. Kontrol Et (False):**
```
GET /api/wishlist/check/2
→ {"inWishlist": false}
```

**15. Sayı Kontrol:**
```
GET /api/wishlist/count
→ {"count": 2}
```

**16. Listele:**
```
GET /api/wishlist?page=0&size=20
→ 2 ürün içeren liste (1 ve 10)
```

---

## 📊 ENDPOINT ÖZET TABLOSU

| Method | Endpoint | Path Param | Query Param | Body | Auth | Rate Limit |
|--------|----------|------------|-------------|------|------|------------|
| GET | `/api/wishlist/count` | - | - | - | ✅ | 60/dk |
| GET | `/api/wishlist/check/{productId}` | productId | - | - | ✅ | 60/dk |
| GET | `/api/wishlist` | - | page, size, sort (format: "field,direction") | - | ✅ | 30/dk |
| POST | `/api/wishlist/{productId}` | productId | - | ❌ | ✅ | 30/dk |
| DELETE | `/api/wishlist/{productId}` | productId | - | ❌ | ✅ | 30/dk |

---

## 📝 HAZIR REQUEST ÖRNEKLERİ

### ✅ GET /api/wishlist/count
```
Method: GET
Endpoint: /api/wishlist/count
Path Parameters: Yok
Query Parameters: Yok
Request Body: Yok
Authorization: Bearer <token>
```

### ✅ GET /api/wishlist/check/{productId}
```
Method: GET
Endpoint: /api/wishlist/check/1
Path Parameters: productId = 1
Query Parameters: Yok
Request Body: Yok
Authorization: Bearer <token>
```

### ✅ GET /api/wishlist (Sayfalı)
```
Method: GET
Endpoint: /api/wishlist?page=0&size=20&sort=createdAt,desc
Path Parameters: Yok
Query Parameters: 
  - page: 0 (opsiyonel, varsayılan: 0)
  - size: 20 (opsiyonel, varsayılan: 20)
  - sort: createdAt,desc (opsiyonel, varsayılan: createdAt,desc)
    ⚠️ Format: "field,direction" (string, virgülle ayrılmış)
    ✅ Örnekler: "createdAt,desc", "createdAt,asc"
Request Body: Yok
Authorization: Bearer <token>
```

### ✅ POST /api/wishlist/{productId}
```
Method: POST
Endpoint: /api/wishlist/1
Path Parameters: productId = 1
Query Parameters: Yok
Request Body: ❌ YOK (Body gerekmez)
Authorization: Bearer <token>
```

### ✅ DELETE /api/wishlist/{productId}
```
Method: DELETE
Endpoint: /api/wishlist/2
Path Parameters: productId = 2
Query Parameters: Yok
Request Body: ❌ YOK (Body gerekmez)
Authorization: Bearer <token>
```

---

## ⚠️ HATA SENARYOLARI

### ❌ TEST 14: Token Olmadan Erişim

**Test:** Authorization header'ı olmadan herhangi bir endpoint'e istek gönder

**Beklenen Response (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

---

### ❌ TEST 15: Geçersiz Token

**Test:** Geçersiz token ile istek gönder
```
Authorization: Bearer invalid-token-123
```

**Beklenen Response (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "Unauthorized"
}
```

---

### ❌ TEST 16: Rate Limit Aşımı

**Test:** Kısa sürede çok fazla istek gönder

**Beklenen Response (429 Too Many Requests):**
```json
{
  "code": "3001",
  "message": "Çok fazla istek gönderildi",
  "status": "TOO_MANY_REQUESTS"
}
```

**Rate Limit Değerleri:**
- `GET /api/wishlist`: **30 istek / 60 saniye**
- `POST /api/wishlist/{productId}`: **30 istek / 60 saniye**
- `DELETE /api/wishlist/{productId}`: **30 istek / 60 saniye**
- `GET /api/wishlist/check/{productId}`: **60 istek / 60 saniye**
- `GET /api/wishlist/count`: **60 istek / 60 saniye**

---

## 🎯 HIZLI TEST CHECKLIST

- [ ] **1. Token Al:** `POST /api/auth/login` → Token kopyala
- [ ] **2. Swagger'da Authorize:** Sağ üstte "Authorize" → `Bearer <token>` yapıştır
- [ ] **3. Boş Kontrol:** `GET /api/wishlist/count` → `{"count": 0}`
- [ ] **4. Ürün Kontrol:** `GET /api/wishlist/check/1` → `{"inWishlist": false}`
- [ ] **5. Ürün Ekle:** `POST /api/wishlist/1` (Body yok) → Başarılı
- [ ] **6. Tekrar Ekle:** `POST /api/wishlist/1` → Aynı item (idempotent)
- [ ] **7. Kontrol Et:** `GET /api/wishlist/check/1` → `{"inWishlist": true}`
- [ ] **8. Sayı Kontrol:** `GET /api/wishlist/count` → `{"count": 1}`
- [ ] **9. Listele:** `GET /api/wishlist` → 1 ürün listelendi
- [ ] **10. Başka Ürün Ekle:** `POST /api/wishlist/2` → Başarılı
- [ ] **11. Başka Ürün Ekle:** `POST /api/wishlist/10` → Başarılı
- [ ] **12. Sayı Kontrol:** `GET /api/wishlist/count` → `{"count": 3}`
- [ ] **13. Listele:** `GET /api/wishlist` → 3 ürün listelendi
- [ ] **14. Ürün Sil:** `DELETE /api/wishlist/2` (Body yok) → 204 No Content
- [ ] **15. Kontrol Et:** `GET /api/wishlist/check/2` → `{"inWishlist": false}`
- [ ] **16. Sayı Kontrol:** `GET /api/wishlist/count` → `{"count": 2}`
- [ ] **17. Listele:** `GET /api/wishlist` → 2 ürün listelendi

---

## 📝 ÖNEMLİ NOTLAR

1. ✅ **Tüm endpoint'ler authentication gerektirir** - Token zorunlu
2. ✅ **POST ve DELETE için body gerekmez** - Sadece path variable yeterli
3. ✅ **GET /api/wishlist için query parametreler opsiyonel** - Varsayılanlar: page=0, size=20, sort=createdAt,desc
4. ✅ **Sort parametresi string formatında olmalı:** `sort=createdAt,desc` (array değil!)
4. ✅ **Aynı ürünü tekrar eklemek hata vermez** - Idempotent davranış (mevcut item döner)
5. ✅ **Olmayan ürünü silmek hata vermez** - Idempotent davranış (204 No Content döner)
6. ✅ **Olmayan ürünü eklemek hata verir** - 404 NOT_FOUND
7. ✅ **Primary image yoksa, ilk image kullanılır** - Hiç image yoksa `productImageUrl: null`
8. ✅ **inStock değeri gerçek zamanlı kontrol edilir** - `product.stock > 0`

---

## 🔗 İLGİLİ ENDPOINT'LER

- `GET /api/wishlist` - Favorileri listele (sayfalı)
- `POST /api/wishlist/{productId}` - Favorilere ekle
- `DELETE /api/wishlist/{productId}` - Favorilerden çıkar
- `GET /api/wishlist/check/{productId}` - Favorilerde mi kontrol et
- `GET /api/wishlist/count` - Favori sayısı

---

**Hazır! Swagger'da test etmeye başlayabilirsiniz! 🚀**
