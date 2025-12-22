# 📍 Address Management (Adres Yönetimi) - Swagger Test Rehberi

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

### ✅ TEST 1: Adres Listesini Al (Boş Liste)

**Method:** `GET`  
**Endpoint:** `/api/addresses`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/addresses` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
[]
```

---

### ✅ TEST 2: İlk Adres Oluştur (SHIPPING - Default)

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** ✅ Gerekli  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "title": "Ev",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Moda",
  "addressLine": "Moda Caddesi No: 123 Daire: 5",
  "postalCode": "34710",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

**Not:** İlk adres otomatik olarak default yapılır, `isDefault: false` gönderseniz bile.

**Swagger'da Test:**
1. `POST /api/addresses` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. Request body'yi yukarıdaki JSON ile doldurun
4. "Execute" butonuna tıklayın

**Beklenen Response (201 Created):**
```json
{
  "id": 1,
  "title": "Ev",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Moda",
  "addressLine": "Moda Caddesi No: 123 Daire: 5",
  "postalCode": "34710",
  "isDefault": true,
  "addressType": "SHIPPING",
  "formattedAddress": "Moda Caddesi No: 123 Daire: 5, Moda, Kadıköy, İstanbul 34710"
}
```

---

### ✅ TEST 3: İkinci Adres Oluştur (SHIPPING)

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** ✅ Gerekli  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "title": "İş Yeri",
  "fullName": "Ahmet Yılmaz",
  "phone": "02121234567",
  "city": "İstanbul",
  "district": "Şişli",
  "neighborhood": "Mecidiyeköy",
  "addressLine": "Büyükdere Caddesi No: 100 Kat: 3",
  "postalCode": "34394",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

**Beklenen Response (201 Created):**
```json
{
  "id": 2,
  "title": "İş Yeri",
  "fullName": "Ahmet Yılmaz",
  "phone": "02121234567",
  "city": "İstanbul",
  "district": "Şişli",
  "neighborhood": "Mecidiyeköy",
  "addressLine": "Büyükdere Caddesi No: 100 Kat: 3",
  "postalCode": "34394",
  "isDefault": false,
  "addressType": "SHIPPING",
  "formattedAddress": "Büyükdere Caddesi No: 100 Kat: 3, Mecidiyeköy, Şişli, İstanbul 34394"
}
```

---

### ✅ TEST 4: BILLING Adresi Oluştur

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** ✅ Gerekli  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "title": "Fatura Adresi",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "Ankara",
  "district": "Çankaya",
  "neighborhood": "Kızılay",
  "addressLine": "Atatürk Bulvarı No: 50",
  "postalCode": "06420",
  "isDefault": true,
  "addressType": "BILLING"
}
```

**Beklenen Response (201 Created):**
```json
{
  "id": 3,
  "title": "Fatura Adresi",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "Ankara",
  "district": "Çankaya",
  "neighborhood": "Kızılay",
  "addressLine": "Atatürk Bulvarı No: 50",
  "postalCode": "06420",
  "isDefault": true,
  "addressType": "BILLING",
  "formattedAddress": "Atatürk Bulvarı No: 50, Kızılay, Çankaya, Ankara 06420"
}
```

---

### ✅ TEST 5: Adres Listesini Al (Tüm Adresler)

**Method:** `GET`  
**Endpoint:** `/api/addresses`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Beklenen Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Ev",
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "city": "İstanbul",
    "district": "Kadıköy",
    "neighborhood": "Moda",
    "addressLine": "Moda Caddesi No: 123 Daire: 5",
    "postalCode": "34710",
    "isDefault": true,
    "addressType": "SHIPPING",
    "formattedAddress": "Moda Caddesi No: 123 Daire: 5, Moda, Kadıköy, İstanbul 34710"
  },
  {
    "id": 2,
    "title": "İş Yeri",
    "fullName": "Ahmet Yılmaz",
    "phone": "02121234567",
    "city": "İstanbul",
    "district": "Şişli",
    "neighborhood": "Mecidiyeköy",
    "addressLine": "Büyükdere Caddesi No: 100 Kat: 3",
    "postalCode": "34394",
    "isDefault": false,
    "addressType": "SHIPPING",
    "formattedAddress": "Büyükdere Caddesi No: 100 Kat: 3, Mecidiyeköy, Şişli, İstanbul 34394"
  },
  {
    "id": 3,
    "title": "Fatura Adresi",
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "city": "Ankara",
    "district": "Çankaya",
    "neighborhood": "Kızılay",
    "addressLine": "Atatürk Bulvarı No: 50",
    "postalCode": "06420",
    "isDefault": true,
    "addressType": "BILLING",
    "formattedAddress": "Atatürk Bulvarı No: 50, Kızılay, Çankaya, Ankara 06420"
  }
]
```

**Not:** Default adresler önce gelir, sonra diğerleri oluşturulma tarihine göre sıralanır.

---

### ✅ TEST 6: Tekil Adres Getir

**Method:** `GET`  
**Endpoint:** `/api/addresses/{id}`  
**Path Parameters:**
- `id` (Long, required): `1`

**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `GET /api/addresses/{id}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `id` alanına `1` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "title": "Ev",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Moda",
  "addressLine": "Moda Caddesi No: 123 Daire: 5",
  "postalCode": "34710",
  "isDefault": true,
  "addressType": "SHIPPING",
  "formattedAddress": "Moda Caddesi No: 123 Daire: 5, Moda, Kadıköy, İstanbul 34710"
}
```

**Alternatif Test:**
- `id: 2` → İş Yeri adresi
- `id: 3` → Fatura adresi

---

### ✅ TEST 7: Adres Güncelle

**Method:** `PUT`  
**Endpoint:** `/api/addresses/{id}`  
**Path Parameters:**
- `id` (Long, required): `2`

**Query Parameters:** Yok  
**Request Body:** ✅ Gerekli  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "title": "İş Yeri (Güncellendi)",
  "fullName": "Ahmet Yılmaz",
  "phone": "02121234568",
  "city": "İstanbul",
  "district": "Şişli",
  "neighborhood": "Mecidiyeköy",
  "addressLine": "Büyükdere Caddesi No: 100 Kat: 5",
  "postalCode": "34394",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

**Swagger'da Test:**
1. `PUT /api/addresses/{id}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `id` alanına `2` yazın
4. Request body'yi yukarıdaki JSON ile doldurun
5. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "id": 2,
  "title": "İş Yeri (Güncellendi)",
  "fullName": "Ahmet Yılmaz",
  "phone": "02121234568",
  "city": "İstanbul",
  "district": "Şişli",
  "neighborhood": "Mecidiyeköy",
  "addressLine": "Büyükdere Caddesi No: 100 Kat: 5",
  "postalCode": "34394",
  "isDefault": false,
  "addressType": "SHIPPING",
  "formattedAddress": "Büyükdere Caddesi No: 100 Kat: 5, Mecidiyeköy, Şişli, İstanbul 34394"
}
```

---

### ✅ TEST 8: Adresi Default Yap (Endpoint ile)

**Method:** `PUT`  
**Endpoint:** `/api/addresses/{id}/default`  
**Path Parameters:**
- `id` (Long, required): `2`

**Query Parameters:** Yok  
**Request Body:** ❌ Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `PUT /api/addresses/{id}/default` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `id` alanına `2` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (200 OK):**
```json
{
  "id": 2,
  "title": "İş Yeri (Güncellendi)",
  "fullName": "Ahmet Yılmaz",
  "phone": "02121234568",
  "city": "İstanbul",
  "district": "Şişli",
  "neighborhood": "Mecidiyeköy",
  "addressLine": "Büyükdere Caddesi No: 100 Kat: 5",
  "postalCode": "34394",
  "isDefault": true,
  "addressType": "SHIPPING",
  "formattedAddress": "Büyükdere Caddesi No: 100 Kat: 5, Mecidiyeköy, Şişli, İstanbul 34394"
}
```

**Not:** Bu işlemden sonra id=1 olan adresin `isDefault` değeri `false` olur (aynı tipte - SHIPPING).

---

### ✅ TEST 9: Adres Güncelle (Default Yaparak)

**Method:** `PUT`  
**Endpoint:** `/api/addresses/{id}`  
**Path Parameters:**
- `id` (Long, required): `1`

**Query Parameters:** Yok  
**Request Body:** ✅ Gerekli  
**Authorization:** ✅ Gerekli (Bearer Token)

**Request Body:**
```json
{
  "title": "Ev",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Moda",
  "addressLine": "Moda Caddesi No: 123 Daire: 5",
  "postalCode": "34710",
  "isDefault": true,
  "addressType": "SHIPPING"
}
```

**Beklenen Response (200 OK):**
```json
{
  "id": 1,
  "title": "Ev",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "İstanbul",
  "district": "Kadıköy",
  "neighborhood": "Moda",
  "addressLine": "Moda Caddesi No: 123 Daire: 5",
  "postalCode": "34710",
  "isDefault": true,
  "addressType": "SHIPPING",
  "formattedAddress": "Moda Caddesi No: 123 Daire: 5, Moda, Kadıköy, İstanbul 34710"
}
```

**Not:** Bu işlemden sonra id=2 olan adresin `isDefault` değeri `false` olur.

---

### ✅ TEST 10: Adres Sil

**Method:** `DELETE`  
**Endpoint:** `/api/addresses/{id}`  
**Path Parameters:**
- `id` (Long, required): `2`

**Query Parameters:** Yok  
**Request Body:** ❌ Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Swagger'da Test:**
1. `DELETE /api/addresses/{id}` endpoint'ini bulun
2. "Try it out" butonuna tıklayın
3. `id` alanına `2` yazın
4. "Execute" butonuna tıklayın

**Beklenen Response (204 No Content):**
```
(Response body yok)
```

**Not:** Default adres silinirse, sistem otomatik olarak başka bir adresi default yapmaz. Kullanıcı manuel olarak yeni default seçmelidir.

---

### ✅ TEST 11: Adres Listesini Al (Silme Sonrası)

**Method:** `GET`  
**Endpoint:** `/api/addresses`  
**Path Parameters:** Yok  
**Query Parameters:** Yok  
**Request Body:** Yok  
**Authorization:** ✅ Gerekli (Bearer Token)

**Beklenen Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Ev",
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "city": "İstanbul",
    "district": "Kadıköy",
    "neighborhood": "Moda",
    "addressLine": "Moda Caddesi No: 123 Daire: 5",
    "postalCode": "34710",
    "isDefault": true,
    "addressType": "SHIPPING",
    "formattedAddress": "Moda Caddesi No: 123 Daire: 5, Moda, Kadıköy, İstanbul 34710"
  },
  {
    "id": 3,
    "title": "Fatura Adresi",
    "fullName": "Ahmet Yılmaz",
    "phone": "05551234567",
    "city": "Ankara",
    "district": "Çankaya",
    "neighborhood": "Kızılay",
    "addressLine": "Atatürk Bulvarı No: 50",
    "postalCode": "06420",
    "isDefault": true,
    "addressType": "BILLING",
    "formattedAddress": "Atatürk Bulvarı No: 50, Kızılay, Çankaya, Ankara 06420"
  }
]
```

---

## ❌ HATA TESTLERİ

### ❌ TEST 12: Başka Kullanıcının Adresini Getirmeye Çalış

**Method:** `GET`  
**Endpoint:** `/api/addresses/{id}`  
**Path Parameters:**
- `id` (Long, required): `999` (olmayan veya başka kullanıcıya ait)

**Beklenen Response (404 Not Found):**
```json
{
  "code": "1006",
  "message": "Kullanıcı bulunamadı",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### ❌ TEST 13: Geçersiz Request Body (Eksik Alanlar)

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Request Body:**
```json
{
  "title": "Ev",
  "fullName": ""
}
```

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "4000",
  "message": "Geçersiz veya eksik parametre",
  "timestamp": "2024-01-15T10:30:00",
  "errors": [
    {
      "field": "fullName",
      "message": "Alıcı adı gerekli"
    },
    {
      "field": "phone",
      "message": "Telefon gerekli"
    },
    {
      "field": "city",
      "message": "Şehir gerekli"
    },
    {
      "field": "district",
      "message": "İlçe gerekli"
    },
    {
      "field": "addressLine",
      "message": "Adres gerekli"
    }
  ]
}
```

---

### ❌ TEST 14: Max Adres Limiti (10 Adres)

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Request Body:**
```json
{
  "title": "Adres 11",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "İstanbul",
  "district": "Beşiktaş",
  "neighborhood": "Ortaköy",
  "addressLine": "Test Adresi",
  "postalCode": "34347",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

**Not:** Eğer kullanıcının zaten 10 adresi varsa:

**Beklenen Response (400 Bad Request):**
```json
{
  "code": "4000",
  "message": "Geçersiz veya eksik parametre",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

### ❌ TEST 15: Token Olmadan İstek

**Method:** `GET`  
**Endpoint:** `/api/addresses`  
**Authorization:** ❌ Yok

**Beklenen Response (401 Unauthorized):**
```json
{
  "code": "1002",
  "message": "Yetkilendirme gerekli",
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 📝 EK TEST SENARYOLARI

### ✅ TEST 16: Neighborhood Olmadan Adres Oluştur

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Request Body:**
```json
{
  "title": "Yazlık",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "Muğla",
  "district": "Bodrum",
  "addressLine": "Sahil Yolu No: 45",
  "postalCode": "48400",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

**Not:** `neighborhood` alanı opsiyonel, boş bırakılabilir.

---

### ✅ TEST 17: Postal Code Olmadan Adres Oluştur

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Request Body:**
```json
{
  "title": "Villa",
  "fullName": "Ahmet Yılmaz",
  "phone": "05551234567",
  "city": "Antalya",
  "district": "Kaş",
  "neighborhood": "Kalkan",
  "addressLine": "Deniz Kenarı Villa No: 12",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

**Not:** `postalCode` alanı opsiyonel, boş bırakılabilir.

---

### ✅ TEST 18: Farklı Şehirlerde Adresler

**Method:** `POST`  
**Endpoint:** `/api/addresses`  
**Request Body:**
```json
{
  "title": "İzmir Ofis",
  "fullName": "Ahmet Yılmaz",
  "phone": "02321234567",
  "city": "İzmir",
  "district": "Konak",
  "neighborhood": "Alsancak",
  "addressLine": "Kordon Boyu No: 200",
  "postalCode": "35220",
  "isDefault": false,
  "addressType": "SHIPPING"
}
```

---

## 🎯 TEST SIRASI ÖNERİSİ

1. ✅ TEST 1: Adres listesini al (boş)
2. ✅ TEST 2: İlk adres oluştur (SHIPPING - default olacak)
3. ✅ TEST 5: Adres listesini al (1 adres var)
4. ✅ TEST 3: İkinci adres oluştur (SHIPPING)
5. ✅ TEST 4: BILLING adresi oluştur
6. ✅ TEST 5: Adres listesini al (3 adres var)
7. ✅ TEST 6: Tekil adres getir
8. ✅ TEST 7: Adres güncelle
9. ✅ TEST 8: Adresi default yap (endpoint ile)
10. ✅ TEST 9: Adres güncelle (default yaparak)
11. ✅ TEST 10: Adres sil
12. ✅ TEST 11: Adres listesini al (silme sonrası)

---

## 📌 ÖNEMLİ NOTLAR

1. **Default Adres Mantığı:**
   - İlk oluşturulan adres otomatik default olur
   - Aynı tipte (SHIPPING/BILLING) sadece bir adres default olabilir
   - Yeni default seçilince eski default false olur

2. **Adres Tipleri:**
   - `SHIPPING`: Teslimat adresi
   - `BILLING`: Fatura adresi
   - Her tip için ayrı default adres olabilir

3. **Max Adres Limiti:**
   - Kullanıcı başına maksimum 10 adres
   - 11. adres oluşturulmaya çalışılırsa hata döner

4. **Güvenlik:**
   - Kullanıcılar sadece kendi adreslerini görebilir/düzenleyebilir/silebilir
   - Başka kullanıcının adresine erişim 404 döner

5. **Formatted Address:**
   - `formattedAddress` alanı otomatik oluşturulur
   - Format: `addressLine, neighborhood, district, city postalCode`

---

## 🔗 İLGİLİ ENDPOINTLER

- `GET /api/addresses` - Tüm adresleri listele
- `GET /api/addresses/{id}` - Tekil adres getir
- `POST /api/addresses` - Yeni adres oluştur
- `PUT /api/addresses/{id}` - Adres güncelle
- `DELETE /api/addresses/{id}` - Adres sil
- `PUT /api/addresses/{id}/default` - Adresi default yap

---

**Test Tarihi:** 2024-01-15  
**API Versiyonu:** v1  
**Swagger URL:** `http://localhost:8080/swagger-ui.html`

