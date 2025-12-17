# 🧪 Product Image Endpoints - Swagger Test Body'leri

Bu dosya, Swagger'dan test ederken kullanabileceğiniz hazır request body örneklerini içerir.

---

## 📋 Test Senaryoları ve Body'ler

### Senaryo 1: İlk Resim Ekleme (Primary)

**Endpoint:** `POST /api/products/{productId}/images`

**Request Body:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=1",
  "altText": "Ürün ön görünüm",
  "displayOrder": 0,
  "isPrimary": true
}
```

**Açıklama:** İlk resim olduğu için `isPrimary: true` yapın.

---

### Senaryo 2: İkinci Resim Ekleme (Normal)

**Endpoint:** `POST /api/products/{productId}/images`

**Request Body:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=2",
  "altText": "Ürün arka görünüm",
  "displayOrder": 1,
  "isPrimary": false
}
```

**Açıklama:** İkinci resim, primary değil.

---

### Senaryo 3: Üçüncü Resim Ekleme (Detay)

**Endpoint:** `POST /api/products/{productId}/images`

**Request Body:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=3",
  "altText": "Ürün yan görünüm detay",
  "displayOrder": 2,
  "isPrimary": false
}
```

---

### Senaryo 4: Dördüncü Resim Ekleme (Minimum Alanlar)

**Endpoint:** `POST /api/products/{productId}/images`

**Request Body:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=4"
}
```

**Açıklama:** Sadece `imageUrl` zorunlu. Diğer alanlar default değer alır:
- `altText`: null
- `displayOrder`: 0
- `isPrimary`: false

---

### Senaryo 5: Beşinci Resim Ekleme (Yüksek Display Order)

**Endpoint:** `POST /api/products/{productId}/images`

**Request Body:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=5",
  "altText": "Ürün yakın çekim",
  "displayOrder": 10,
  "isPrimary": false
}
```

**Açıklama:** Yüksek displayOrder ile eklenir, sıralamada en sonda görünür.

---

## 🔄 Primary Resim Değiştirme Senaryoları

### Senaryo 6: Mevcut Resmi Primary Yap

**Endpoint:** `PUT /api/products/{productId}/images/{imageId}/primary`

**Request Body:** 
❌ **Body gerekmez!** Bu endpoint sadece path parametreleri kullanır.

**Path Parameters:**
- `productId`: 1
- `imageId`: 2 (örneğin ikinci resmi primary yapmak için)

**Açıklama:** Bu endpoint body almaz, sadece URL'deki `imageId` ile çalışır.

---

## 🗑️ Silme Senaryoları

### Senaryo 7: Resim Silme

**Endpoint:** `DELETE /api/products/{productId}/images/{imageId}`

**Request Body:** 
❌ **Body gerekmez!** Bu endpoint sadece path parametreleri kullanır.

**Path Parameters:**
- `productId`: 1
- `imageId`: 3 (örneğin üçüncü resmi silmek için)

---

## 📖 Listeleme Senaryoları

### Senaryo 8: Tüm Resimleri Listele

**Endpoint:** `GET /api/products/{productId}/images`

**Request Body:** 
❌ **Body gerekmez!** Bu endpoint sadece path parametreleri kullanır.

**Path Parameters:**
- `productId`: 1

**Beklenen Response:**
```json
[
  {
    "id": 1,
    "productId": 1,
    "imageUrl": "https://picsum.photos/800/600?random=1",
    "altText": "Ürün ön görünüm",
    "displayOrder": 0,
    "isPrimary": true
  },
  {
    "id": 2,
    "productId": 1,
    "imageUrl": "https://picsum.photos/800/600?random=2",
    "altText": "Ürün arka görünüm",
    "displayOrder": 1,
    "isPrimary": false
  }
]
```

**Not:** Primary resim her zaman listenin en başında görünür.

---

## 🎯 Tam Test Akışı (Sıralı)

### Adım 1: İlk Resim Ekle (Primary)
```json
POST /api/products/1/images
{
  "imageUrl": "https://picsum.photos/800/600?random=1",
  "altText": "Ürün ön görünüm",
  "displayOrder": 0,
  "isPrimary": true
}
```
**Beklenen:** `{ "id": 1, "isPrimary": true, ... }`

---

### Adım 2: İkinci Resim Ekle
```json
POST /api/products/1/images
{
  "imageUrl": "https://picsum.photos/800/600?random=2",
  "altText": "Ürün arka görünüm",
  "displayOrder": 1,
  "isPrimary": false
}
```
**Beklenen:** `{ "id": 2, "isPrimary": false, ... }`

---

### Adım 3: Üçüncü Resim Ekle
```json
POST /api/products/1/images
{
  "imageUrl": "https://picsum.photos/800/600?random=3",
  "altText": "Ürün yan görünüm",
  "displayOrder": 2,
  "isPrimary": false
}
```
**Beklenen:** `{ "id": 3, "isPrimary": false, ... }`

---

### Adım 4: Resimleri Listele
```
GET /api/products/1/images
```
**Beklenen:** 3 resim, primary (id:1) en başta

---

### Adım 5: İkinci Resmi Primary Yap
```
PUT /api/products/1/images/2/primary
```
**Beklenen:** `{ "id": 2, "isPrimary": true, ... }`

**Not:** Artık id:1'in `isPrimary` değeri `false` olmalı.

---

### Adım 6: Tekrar Listele (Kontrol)
```
GET /api/products/1/images
```
**Beklenen:** id:2 en başta (primary), sonra id:1, sonra id:3

---

### Adım 7: Üçüncü Resmi Sil
```
DELETE /api/products/1/images/3
```
**Beklenen:** `204 No Content`

---

### Adım 8: Son Kontrol - Listele
```
GET /api/products/1/images
```
**Beklenen:** Sadece 2 resim (id:1 ve id:2), id:2 primary

---

## 🧪 Hata Senaryoları (Test İçin)

### Senaryo 9: Geçersiz URL ile Resim Ekle
```json
POST /api/products/1/images
{
  "imageUrl": "",
  "altText": "Test",
  "displayOrder": 0,
  "isPrimary": false
}
```
**Beklenen:** `400 Bad Request` - "Image URL is required"

---

### Senaryo 10: Olmayan Ürün ID ile Resim Ekle
```json
POST /api/products/99999/images
{
  "imageUrl": "https://picsum.photos/800/600?random=1",
  "altText": "Test",
  "displayOrder": 0,
  "isPrimary": false
}
```
**Beklenen:** `404 Not Found` - "Ürün bulunamadı"

---

### Senaryo 11: Olmayan Resim ID ile Sil
```
DELETE /api/products/1/images/99999
```
**Beklenen:** `404 Not Found` - "Ürün resmi bulunamadı"

---

### Senaryo 12: Olmayan Resim ID ile Primary Yap
```
PUT /api/products/1/images/99999/primary
```
**Beklenen:** `404 Not Found` - "Ürün resmi bulunamadı"

---

## 📝 Gerçekçi Ürün Resim Örnekleri

### Giyim Ürünü İçin Örnekler:

**1. Ön Görünüm:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=1",
  "altText": "Kırmızı tişört ön görünüm",
  "displayOrder": 0,
  "isPrimary": true
}
```

**2. Arka Görünüm:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=2",
  "altText": "Kırmızı tişört arka görünüm",
  "displayOrder": 1,
  "isPrimary": false
}
```

**3. Detay Görünüm:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=3",
  "altText": "Kırmızı tişört kumaş detayı",
  "displayOrder": 2,
  "isPrimary": false
}
```

**4. Model Üzerinde:**
```json
{
  "imageUrl": "https://picsum.photos/800/600?random=4",
  "altText": "Kırmızı tişört model üzerinde",
  "displayOrder": 3,
  "isPrimary": false
}
```

---

## 💡 İpuçları

1. **Primary Resim:** Her zaman sadece bir resim primary olabilir. Yeni bir resmi primary yaparsanız, eski primary otomatik olarak `false` olur.

2. **Display Order:** Düşük sayılar önce görünür. Primary resim her zaman en başta görünür, displayOrder'dan bağımsız.

3. **Alt Text:** SEO ve erişilebilirlik için önemli. Her resim için açıklayıcı alt text yazın.

4. **Image URL:** Gerçek projede S3/MinIO gibi bir storage servisi kullanılır. Test için `picsum.photos` veya `placeholder.com` kullanabilirsiniz.

5. **Validation:** Sadece `imageUrl` zorunludur. Diğer alanlar opsiyonel ve default değerler alır.

---

## 🚀 Hızlı Kopyala-Yapıştır

Swagger'da hızlı test için:

**İlk Resim:**
```json
{"imageUrl":"https://picsum.photos/800/600?random=1","altText":"Ön görünüm","displayOrder":0,"isPrimary":true}
```

**İkinci Resim:**
```json
{"imageUrl":"https://picsum.photos/800/600?random=2","altText":"Arka görünüm","displayOrder":1,"isPrimary":false}
```

**Üçüncü Resim:**
```json
{"imageUrl":"https://picsum.photos/800/600?random=3","altText":"Yan görünüm","displayOrder":2,"isPrimary":false}
```

**Minimum (Sadece URL):**
```json
{"imageUrl":"https://picsum.photos/800/600?random=4"}
```

