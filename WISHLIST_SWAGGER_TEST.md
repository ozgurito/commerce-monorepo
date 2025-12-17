# ❤️ Wishlist (Favoriler) - Swagger Test Rehberi

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

## 📋 ENDPOINT TESTLERİ

### ✅ TEST 1: Favori Sayısını Al

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

### ✅ TEST 2: Ürün Favorilerde Mi? (Kontrol)

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
**Request Body:** Yok (Path variable yeterli)  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `POST /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `1` yazın
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

**Alternatif Test:**
- `productId: 2` → İkinci ürün ekle
- `productId: 10` → Üçüncü ürün ekle

---

### ✅ TEST 4: Aynı Ürünü Tekrar Ekle (Idempotent Test)

**Method:** `POST`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `1` (TEST 3'te eklenen ürün)

**Query Parameters:** Yok  
**Request Body:** Yok  
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

**Not:** Hata vermez, mevcut item döner.

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
**Query Parameters:**
- `page` (Integer, optional): `0` (varsayılan: 0)
- `size` (Integer, optional): `20` (varsayılan: 20)
- `sort` (String, optional): `createdAt,desc` (varsayılan: createdAt,desc)

**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. Query parametrelerini doldurun (veya varsayılanları kullanın):
   - `page`: `0`
   - `size`: `20`
   - `sort`: `createdAt,desc`
4. "Execute" butonuna tıklayın

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
- `sort`: `createdAt,desc`

**Farklı sıralama:**
- `page`: `0`
- `size`: `20`
- `sort`: `createdAt,asc` (en eski önce)

**İkinci sayfa:**
- `page`: `1`
- `size`: `10`
- `sort`: `createdAt,desc`

---

### ✅ TEST 8: Favorilerden Ürün Çıkar

**Method:** `DELETE`  
**Endpoint:** `/api/wishlist/{productId}`  
**Path Parameters:**
- `productId` (Long, required): `2`

**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `DELETE /api/wishlist/{productId}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `productId` alanına `2` yazın
4. "Execute" butonuna tıklayın

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
- `sort`: `createdAt,desc`

**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/wishlist` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. Query parametrelerini doldurun
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
**Request Body:** Yok  
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
**Request Body:** Yok  
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

## 🔄 TAM TEST AKIŞI (Sıralı)

Aşağıdaki sırayla test edin:

1. **Token Al:**
   ```
   POST /api/auth/login
   Body: {"email": "test@example.com", "password": "password123"}
   ```

2. **Boş Kontrol:**
   ```
   GET /api/wishlist/count
   Beklenen: {"count": 0}
   ```

3. **Ürün Kontrol (False):**
   ```
   GET /api/wishlist/check/1
   Beklenen: {"inWishlist": false}
   ```

4. **Ürün Ekle:**
   ```
   POST /api/wishlist/1
   Beklenen: WishlistItemDto (200 OK)
   ```

5. **Tekrar Ekle (Idempotent):**
   ```
   POST /api/wishlist/1
   Beklenen: Aynı item döner (200 OK)
   ```

6. **Kontrol Et (True):**
   ```
   GET /api/wishlist/check/1
   Beklenen: {"inWishlist": true}
   ```

7. **Sayı Kontrol:**
   ```
   GET /api/wishlist/count
   Beklenen: {"count": 1}
   ```

8. **Listele:**
   ```
   GET /api/wishlist?page=0&size=20&sort=createdAt,desc
   Beklenen: 1 ürün içeren liste
   ```

9. **Başka Ürün Ekle:**
   ```
   POST /api/wishlist/2
   POST /api/wishlist/10
   ```

10. **Sayı Kontrol:**
    ```
    GET /api/wishlist/count
    Beklenen: {"count": 3}
    ```

11. **Listele:**
    ```
    GET /api/wishlist?page=0&size=20
    Beklenen: 3 ürün içeren liste
    ```

12. **Ürün Sil:**
    ```
    DELETE /api/wishlist/2
    Beklenen: 204 No Content
    ```

13. **Kontrol Et (False):**
    ```
    GET /api/wishlist/check/2
    Beklenen: {"inWishlist": false}
    ```

14. **Sayı Kontrol:**
    ```
    GET /api/wishlist/count
    Beklenen: {"count": 2}
    ```

15. **Listele:**
    ```
    GET /api/wishlist?page=0&size=20
    Beklenen: 2 ürün içeren liste (1 ve 10)
    ```

---

## 📊 ENDPOINT ÖZET TABLOSU

| Method | Endpoint | Path Param | Query Param | Body | Auth |
|--------|----------|------------|-------------|------|------|
| GET | `/api/wishlist/count` | - | - | - | ✅ |
| GET | `/api/wishlist/check/{productId}` | productId | - | - | ✅ |
| GET | `/api/wishlist` | - | page, size, sort | - | ✅ |
| POST | `/api/wishlist/{productId}` | productId | - | - | ✅ |
| DELETE | `/api/wishlist/{productId}` | productId | - | - | ✅ |

---

## ⚠️ HATA SENARYOLARI

### ❌ Token Olmadan Erişim

**Test:** Authorization header'ı olmadan herhangi bir endpoint'e istek gönder

**Beklenen Response (401 Unauthorized):**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource"
}
```

### ❌ Geçersiz Token

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

### ❌ Rate Limit Aşımı

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

## 📝 ÖNEMLİ NOTLAR

1. ✅ **Tüm endpoint'ler authentication gerektirir** - Token zorunlu
2. ✅ **POST ve DELETE için body gerekmez** - Sadece path variable yeterli
3. ✅ **GET /api/wishlist için query parametreler opsiyonel** - Varsayılanlar: page=0, size=20, sort=createdAt,desc
4. ✅ **Aynı ürünü tekrar eklemek hata vermez** - Idempotent davranış
5. ✅ **Olmayan ürünü silmek hata vermez** - Idempotent davranış
6. ✅ **Olmayan ürünü eklemek hata verir** - 404 NOT_FOUND

---

## 🎯 HIZLI TEST CHECKLIST

- [ ] Token alındı ve Swagger'a eklendi
- [ ] `GET /api/wishlist/count` → count: 0
- [ ] `GET /api/wishlist/check/1` → inWishlist: false
- [ ] `POST /api/wishlist/1` → Başarılı
- [ ] `POST /api/wishlist/1` → Aynı item (idempotent)
- [ ] `GET /api/wishlist/check/1` → inWishlist: true
- [ ] `GET /api/wishlist/count` → count: 1
- [ ] `GET /api/wishlist` → 1 ürün listelendi
- [ ] `POST /api/wishlist/2` → Başarılı
- [ ] `POST /api/wishlist/10` → Başarılı
- [ ] `GET /api/wishlist/count` → count: 3
- [ ] `GET /api/wishlist` → 3 ürün listelendi
- [ ] `DELETE /api/wishlist/2` → 204 No Content
- [ ] `GET /api/wishlist/check/2` → inWishlist: false
- [ ] `GET /api/wishlist/count` → count: 2
- [ ] `GET /api/wishlist` → 2 ürün listelendi

---

**Hazır! Swagger'da test etmeye başlayabilirsiniz! 🚀**

