# 🧪 Cart Variant Test Rehberi

## 📋 Test Öncesi Hazırlık

### 1. Uygulamayı Başlat
```bash
# Uygulama çalışıyor olmalı
# Swagger UI: http://localhost:8080/swagger-ui.html
```

### 2. Authentication Token Al
Swagger'da `/api/auth/login` endpoint'ini kullanarak token alın:
```json
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

Response'dan `accessToken` değerini kopyalayın ve Swagger'ın sağ üst köşesindeki **"Authorize"** butonuna tıklayıp token'ı girin:
```
Bearer <your-token-here>
```

---

## 🧪 Test Senaryoları

### ✅ TEST 1: Variant Olmadan Sepete Ekleme (Eski Davranış)
**Endpoint:** `POST /api/cart/items`

**Request (variantId göndermeyin veya null bırakın):**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**⚠️ ÖNEMLİ:** `variantId: 0` veya `variantId: null` göndermeyin! Eğer variant yoksa, `variantId` alanını hiç eklemeyin veya request body'den tamamen çıkarın.

**Beklenen Sonuç:**
- ✅ Sepete ürün eklendi
- ✅ `variantId`, `variantName`, `size`, `color` alanları `null` olmalı
- ✅ `availableStock` ürün stoğunu göstermeli

---

### ✅ TEST 2: Variant ile Sepete Ekleme
**Endpoint:** `POST /api/cart/items`

**Önce Variant ID'yi Bul:**
```sql
-- Veritabanında variant'ları görmek için:
SELECT pv.id, pv.product_id, p.name as product_name, 
       pv.name as variant_name, pv.size, pv.color, pv.stock, pv.price_modifier
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
LIMIT 10;
```

**Request:**
```json
{
  "productId": 10,
  "quantity": 1,
  "variantId": 1
}
```

**Beklenen Sonuç:**
- ✅ Sepete ürün eklendi
- ✅ Response'da `variantId`, `variantName`, `size`, `color` alanları dolu olmalı
- ✅ `availableStock` variant stoğunu göstermeli
- ✅ `unitPrice` = product.price + variant.priceModifier olmalı

---

### ✅ TEST 3: Aynı Ürün + Aynı Variant Tekrar Ekleme
**Endpoint:** `POST /api/cart/items`

**Request (TEST 2'den sonra):**
```json
{
  "productId": 10,
  "quantity": 1,
  "variantId": 1
}
```

**Beklenen Sonuç:**
- ✅ Yeni item oluşturulmamalı
- ✅ Mevcut item'ın `quantity` değeri artmalı (1 + 1 = 2)
- ✅ `totalPrice` güncellenmeli

---

### ✅ TEST 4: Aynı Ürün + Farklı Variant Ekleme
**Endpoint:** `POST /api/cart/items`

**Request:**
```json
{
  "productId": 10,
  "quantity": 1,
  "variantId": 2
}
```

**Beklenen Sonuç:**
- ✅ Yeni bir cart item oluşturulmalı (çünkü variant farklı)
- ✅ Sepette 2 ayrı item olmalı (aynı ürün, farklı variantlar)

---

### ✅ TEST 5: Variant Olmadan + Variant ile Aynı Ürün
**Endpoint:** `POST /api/cart/items`

**Adım 1 - Variant olmadan:**
```json
{
  "productId": 10,
  "quantity": 1
}
```

**Adım 2 - Variant ile:**
```json
{
  "productId": 10,
  "quantity": 1,
  "variantId": 1
}
```

**Beklenen Sonuç:**
- ✅ Sepette 2 ayrı item olmalı
- ✅ Birincisi variant bilgisi olmadan
- ✅ İkincisi variant bilgisi ile

---

### ❌ TEST 6: Geçersiz Variant ID
**Endpoint:** `POST /api/cart/items`

**Request:**
```json
{
  "productId": 10,
  "quantity": 1,
  "variantId": 99999
}
```

**Beklenen Sonuç:**
- ❌ `4009 - VARIANT_NOT_FOUND` hatası dönmeli

---

### ❌ TEST 7: Yanlış Ürüne Ait Variant
**Endpoint:** `POST /api/cart/items`

**Request:**
```json
{
  "productId": 1,
  "quantity": 1,
  "variantId": 5  // Bu variant productId=10'a ait
}
```

**Beklenen Sonuç:**
- ❌ `4009 - VARIANT_NOT_FOUND` hatası dönmeli

---

### ❌ TEST 8: Yetersiz Stok (Variant)
**Endpoint:** `POST /api/cart/items`

**Request:**
```json
{
  "productId": 10,
  "quantity": 1000,  // Variant stoğundan fazla
  "variantId": 1
}
```

**Beklenen Sonuç:**
- ❌ `INSUFFICIENT_STOCK` hatası dönmeli

---

### ✅ TEST 9: Sepeti Görüntüleme (GET)
**Endpoint:** `GET /api/cart`

**Beklenen Sonuç:**
- ✅ Tüm cart item'ları dönmeli
- ✅ Variant bilgileri (`variantId`, `variantName`, `size`, `color`) doğru görünmeli
- ✅ Variant olmayan item'larda bu alanlar `null` olmalı

---

### ✅ TEST 10: Cart Item Güncelleme (Variant ile)
**Endpoint:** `PUT /api/cart/items/{itemId}`

**Request:**
```json
{
  "quantity": 3
}
```

**Beklenen Sonuç:**
- ✅ Quantity güncellenmeli
- ✅ Variant stoğu kontrol edilmeli
- ✅ Total price güncellenmeli

---

## 📊 Response Örnekleri

### Variant ile Cart Item Response:
```json
{
  "id": 1,
  "productId": 10,
  "productName": "T-Shirt",
  "quantity": 2,
  "unitPrice": 150.00,
  "totalPrice": 300.00,
  "availableStock": 50,
  "variantId": 1,
  "variantName": "M - Mavi",
  "size": "M",
  "color": "Mavi"
}
```

### Variant Olmadan Cart Item Response:
```json
{
  "id": 2,
  "productId": 5,
  "productName": "Basic Product",
  "quantity": 1,
  "unitPrice": 100.00,
  "totalPrice": 100.00,
  "availableStock": 20,
  "variantId": null,
  "variantName": null,
  "size": null,
  "color": null
}
```

---

## 🔍 Veritabanı Kontrol Sorguları

### Sepetteki Item'ları Kontrol Et:
```sql
SELECT 
    ci.id,
    ci.cart_id,
    p.name as product_name,
    pv.name as variant_name,
    pv.size,
    pv.color,
    ci.quantity,
    ci.unit_price,
    ci.total_price
FROM cart_items ci
JOIN products p ON p.id = ci.product_id
LEFT JOIN product_variants pv ON pv.id = ci.product_variant_id
ORDER BY ci.id DESC
LIMIT 10;
```

### Variant'ları Liste:
```sql
SELECT 
    pv.id,
    p.id as product_id,
    p.name as product_name,
    pv.name as variant_name,
    pv.size,
    pv.color,
    pv.stock,
    pv.price_modifier,
    pv.is_active
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
ORDER BY p.id, pv.id;
```

---

## ✅ Başarı Kriterleri

1. ✅ Variant olmadan sepete ekleme çalışıyor
2. ✅ Variant ile sepete ekleme çalışıyor
3. ✅ Aynı ürün + aynı variant tekrar eklenince quantity artıyor
4. ✅ Aynı ürün + farklı variant ayrı item olarak ekleniyor
5. ✅ Variant bilgileri response'da doğru görünüyor
6. ✅ Hata durumları doğru mesajlarla dönüyor
7. ✅ Stok kontrolü variant stoğunu kullanıyor
8. ✅ Fiyat hesaplama variant price modifier'ı ekliyor

---

## 🐛 Sorun Giderme

### Migration Çalışmadıysa:
```sql
-- Manuel olarak kontrol et:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND column_name = 'product_variant_id';
```

### Constraint Hatası:
```sql
-- Unique constraint'i kontrol et:
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cart_items';
```

---

**Test Tarihi:** [Bugünün Tarihi]  
**Test Eden:** [İsminiz]  
**Sonuç:** ✅ / ❌

