# 🖼️ Product Image Endpoints - Swagger Test Rehberi

## 📋 Endpoint'ler

### 1. **GET** `/api/products/{productId}/images`
- **Açıklama:** Ürünün tüm resimlerini listeler
- **Yetki:** Public (Authentication gerekmez)
- **Örnek:** `GET /api/products/1/images`

### 2. **POST** `/api/products/{productId}/images`
- **Açıklama:** Ürüne yeni resim ekler
- **Yetki:** ADMIN only
- **Request Body:**
```json
{
  "imageUrl": "https://example.com/image.jpg",
  "altText": "Product image description",
  "displayOrder": 0,
  "isPrimary": true
}
```

### 3. **DELETE** `/api/products/{productId}/images/{imageId}`
- **Açıklama:** Üründen resim siler
- **Yetki:** ADMIN only
- **Örnek:** `DELETE /api/products/1/images/5`

### 4. **PUT** `/api/products/{productId}/images/{imageId}/primary`
- **Açıklama:** Bir resmi primary (ana resim) yapar
- **Yetki:** ADMIN only
- **Örnek:** `PUT /api/products/1/images/5/primary`

---

## 🧪 Swagger'dan Test Adımları

### Adım 1: Swagger UI'ya Erişim
1. Uygulamayı başlatın: `mvn spring-boot:run`
2. Tarayıcıda açın: **http://localhost:8080/swagger-ui.html**

### Adım 2: Authentication (ADMIN için)
ADMIN endpoint'leri için JWT token gerekir:

1. **Login yapın:**
   - Swagger'da `POST /api/auth/login` endpoint'ini bulun
   - Request body:
   ```json
   {
     "email": "admin@example.com",
     "password": "your-password"
   }
   ```
   - Response'dan `accessToken` değerini kopyalayın

2. **Token'ı Swagger'a ekleyin:**
   - Swagger UI'nin sağ üst köşesinde **"Authorize"** butonuna tıklayın
   - `Bearer {token}` formatında token'ı yapıştırın
   - Örnek: `Bearer eyJhbGciOiJIUzM4NCJ9...`

### Adım 3: Test Senaryoları

#### Senaryo 1: Ürün resimlerini listele (Public)
1. `GET /api/products/{productId}/images` endpoint'ini açın
2. `productId` parametresine bir ürün ID'si girin (örn: `1`)
3. **Execute** butonuna tıklayın
4. Response'da resim listesini görmelisiniz

#### Senaryo 2: Ürüne resim ekle (ADMIN)
1. `POST /api/products/{productId}/images` endpoint'ini açın
2. `productId` parametresine bir ürün ID'si girin (örn: `1`)
3. Request body'yi doldurun:

   **İlk Resim (Primary):**
   ```json
   {
     "imageUrl": "https://picsum.photos/800/600?random=1",
     "altText": "Ürün ön görünüm",
     "displayOrder": 0,
     "isPrimary": true
   }
   ```

   **İkinci Resim (Normal):**
   ```json
   {
     "imageUrl": "https://picsum.photos/800/600?random=2",
     "altText": "Ürün arka görünüm",
     "displayOrder": 1,
     "isPrimary": false
   }
   ```

   **Minimum (Sadece URL):**
   ```json
   {
     "imageUrl": "https://picsum.photos/800/600?random=3"
   }
   ```

4. **Execute** butonuna tıklayın
5. Response'da eklenen resim bilgilerini görmelisiniz

**📝 Detaylı body örnekleri için:** `PRODUCT_IMAGE_SWAGGER_TEST_BODIES.md` dosyasına bakın

#### Senaryo 3: Primary resim ayarla (ADMIN)
1. Önce birkaç resim ekleyin (isPrimary: false ile)
2. `PUT /api/products/{productId}/images/{imageId}/primary` endpoint'ini açın
3. `productId` ve `imageId` parametrelerini doldurun
4. **Execute** butonuna tıklayın
5. Response'da primary olarak ayarlanan resmi görmelisiniz
6. `GET /api/products/{productId}/images` ile kontrol edin - primary resim en başta olmalı

#### Senaryo 4: Resim sil (ADMIN)
1. `DELETE /api/products/{productId}/images/{imageId}` endpoint'ini açın
2. `productId` ve `imageId` parametrelerini doldurun
3. **Execute** butonuna tıklayın
4. Response: `204 No Content` dönmeli
5. `GET /api/products/{productId}/images` ile kontrol edin - resim listeden kalkmış olmalı

---

## ✅ Beklenen Sonuçlar

### GET Response Örneği:
```json
[
  {
    "id": 1,
    "productId": 1,
    "imageUrl": "https://example.com/image1.jpg",
    "altText": "Product front view",
    "displayOrder": 0,
    "isPrimary": true
  },
  {
    "id": 2,
    "productId": 1,
    "imageUrl": "https://example.com/image2.jpg",
    "altText": "Product back view",
    "displayOrder": 1,
    "isPrimary": false
  }
]
```

### POST Response Örneği:
```json
{
  "id": 3,
  "productId": 1,
  "imageUrl": "https://example.com/image3.jpg",
  "altText": "Product side view",
  "displayOrder": 2,
  "isPrimary": false
}
```

---

## 🔍 Kontrol Listesi

- [ ] GET endpoint public olarak çalışıyor (token olmadan)
- [ ] POST endpoint ADMIN token ile çalışıyor
- [ ] DELETE endpoint ADMIN token ile çalışıyor
- [ ] PUT /primary endpoint ADMIN token ile çalışıyor
- [ ] Primary resim eklenince diğer primary'ler false oluyor
- [ ] Resimler primary ve displayOrder'a göre sıralanıyor
- [ ] Resim silindiğinde product'tan da kaldırılıyor
- [ ] Validation çalışıyor (imageUrl boş olamaz)

---

## 🐛 Olası Hatalar

### 401 Unauthorized
- **Sebep:** Token eksik veya geçersiz
- **Çözüm:** Token'ı Swagger Authorize butonundan ekleyin

### 403 Forbidden
- **Sebep:** Kullanıcı ADMIN rolüne sahip değil
- **Çözüm:** ADMIN rolüne sahip bir kullanıcı ile login yapın

### 404 Not Found
- **Sebep:** Product veya Image bulunamadı
- **Çözüm:** Geçerli productId ve imageId kullanın
- **Not:** Artık resim bulunamadığında "Ürün resmi bulunamadı" hatası döner (önceden "Ürün bulunamadı" diyordu)

### 400 Bad Request
- **Sebep:** Validation hatası (imageUrl boş)
- **Çözüm:** Request body'yi kontrol edin

---

## 📝 Notlar

- Primary resim her zaman listenin en başında görünür
- Aynı anda sadece bir resim primary olabilir
- displayOrder değeri düşük olan resimler önce görünür
- Resim silindiğinde product'tan otomatik olarak kaldırılır

