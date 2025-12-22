# 🔐 Password Reset - End-to-End Test Rehberi (Adım Adım)

Bu rehber, Swagger'da baştan sona password reset akışını test etmeniz için hazırlanmıştır.

---

## 📋 ÖN HAZIRLIK

### Adım 0: Swagger UI'ı Aç
```
http://localhost:8080/swagger-ui.html
```

---

## 🎯 TAM TEST AKIŞI (Step-by-Step)

### ✅ ADIM 1: Yeni Kullanıcı Kaydet (Register)

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "oldpassword123",
  "fullName": "Test User"
}
```

**Beklenen Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "email": "testuser@example.com"
}
```

**✅ Kontrol:** Kullanıcı başarıyla kaydedildi.

---

### ✅ ADIM 2: Eski Şifre ile Login Test Et (Doğrulama)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "oldpassword123"
}
```

**Beklenen Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "email": "testuser@example.com"
}
```

**✅ Kontrol:** Eski şifre ile login başarılı. Şimdi şifreyi sıfırlayacağız.

---

### ✅ ADIM 3: Şifre Sıfırlama Token'ı İste (Forgot Password)

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "testuser@example.com"
}
```

**Beklenen Response:**
```json
{
  "message": "Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi.",
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**⚠️ ÖNEMLİ:** 
- Response'daki `token` değerini **KOPYALA** ve bir yere kaydet!
- Bu token'ı bir sonraki adımlarda kullanacağız.

**✅ Kontrol:** Token başarıyla oluşturuldu.

---

### ✅ ADIM 4: Token'ı Doğrula (Opsiyonel ama Önerilir)

**Endpoint:** `GET /api/auth/reset-password/validate`

**Query Parameter:**
```
token=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Tam URL (Swagger'da):**
- Parameter kısmına: `a1b2c3d4-e5f6-7890-abcd-ef1234567890` yaz

**Beklenen Response:**
```json
{
  "valid": true
}
```

**✅ Kontrol:** Token geçerli ve kullanılabilir.

---

### ✅ ADIM 5: Şifreyi Sıfırla (Reset Password)

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**⚠️ ÖNEMLİ:** 
- `token`: Adım 3'te aldığın token'ı kullan
- `newPassword` ve `confirmPassword` **AYNI** olmalı
- Şifre minimum 6 karakter olmalı

**Beklenen Response:**
```json
{
  "message": "Şifreniz başarıyla güncellendi."
}
```

**✅ Kontrol:** Şifre başarıyla güncellendi.

---

### ✅ ADIM 6: Eski Şifre ile Login Denemesi (Başarısız Olmalı)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "oldpassword123"
}
```

**Beklenen Response (Hata):**
```json
{
  "code": "1001",
  "message": "Kullanıcı adı veya şifre hatalı",
  "status": 401,
  "timestamp": "2025-12-16T...",
  "path": "/api/auth/login"
}
```

**✅ Kontrol:** Eski şifre artık çalışmıyor (beklenen davranış).

---

### ✅ ADIM 7: Yeni Şifre ile Login Test Et (Başarılı Olmalı)

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "testuser@example.com",
  "password": "newpassword123"
}
```

**Beklenen Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "email": "testuser@example.com"
}
```

**✅ Kontrol:** Yeni şifre ile login başarılı!

---

### ✅ ADIM 8: Aynı Token'ı Tekrar Kullanmayı Dene (Başarısız Olmalı)

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "newPassword": "anotherpassword123",
  "confirmPassword": "anotherpassword123"
}
```

**Beklenen Response (Hata):**
```json
{
  "code": "1013",
  "message": "Bu şifre sıfırlama linki zaten kullanılmış",
  "status": 400,
  "timestamp": "2025-12-16T...",
  "path": "/api/auth/reset-password"
}
```

**✅ Kontrol:** Token tek kullanımlık çalışıyor (beklenen davranış).

---

## 📊 TEST CHECKLIST

Her adımı tamamladıktan sonra işaretle:

- [ ] **Adım 1:** Kullanıcı başarıyla kaydedildi
- [ ] **Adım 2:** Eski şifre ile login başarılı
- [ ] **Adım 3:** Token başarıyla oluşturuldu ve response'da döndü
- [ ] **Adım 4:** Token geçerliliği doğrulandı (`valid: true`)
- [ ] **Adım 5:** Şifre başarıyla sıfırlandı
- [ ] **Adım 6:** Eski şifre ile login başarısız (beklenen)
- [ ] **Adım 7:** Yeni şifre ile login başarılı
- [ ] **Adım 8:** Aynı token tekrar kullanılamadı (beklenen)

---

## 🎯 HIZLI TEST (Kopyala-Yapıştır)

Eğer zaten kayıtlı bir kullanıcın varsa, direkt şu adımları takip et:

### 1. Token İste
```json
POST /api/auth/forgot-password
{
  "email": "testuser@example.com"
}
```

### 2. Response'dan Token'ı Kopyala
```json
{
  "message": "...",
  "token": "BURADAKI_TOKEN_I_KOPYALA"  ← Bu token'ı kopyala
}
```

### 3. Şifreyi Sıfırla
```json
POST /api/auth/reset-password
{
  "token": "BURADAKI_TOKEN_I_KOPYALA",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

### 4. Yeni Şifre ile Login
```json
POST /api/auth/login
{
  "email": "testuser@example.com",
  "password": "newpassword123"
}
```

✅ **Başarılı!**

---

## 🔍 ÖNEMLİ NOTLAR

1. **Token Süresi:** Token'lar 24 saat geçerlidir
2. **Token Tek Kullanımlık:** Bir token kullanıldıktan sonra tekrar kullanılamaz
3. **Rate Limiting:** 
   - `forgot-password`: 5 dakikada max 5 istek
   - `reset-password`: 5 dakikada max 5 istek
4. **Güvenlik:** Email kayıtlı değilse bile aynı mesaj döner
5. **Development Mode:** Token response'da döner (production'da email ile gönderilir)

---

## ❌ YAYGIN HATALAR VE ÇÖZÜMLERİ

### Hata 1: "Token gerekli" hatası
**Sebep:** Token'ı yanlış kopyaladın veya boş bıraktın
**Çözüm:** Adım 3'teki response'dan token'ı doğru kopyala

### Hata 2: "Geçersiz şifre sıfırlama linki"
**Sebep:** Token yanlış veya zaten kullanılmış
**Çözüm:** Yeni bir token iste (Adım 3'ü tekrarla)

### Hata 3: "Şifreler eşleşmiyor"
**Sebep:** `newPassword` ve `confirmPassword` farklı
**Çözüm:** İkisini de aynı yap

### Hata 4: "Çok fazla istek gönderildi"
**Sebep:** Rate limit aşıldı
**Çözüm:** 5 dakika bekle veya farklı bir email kullan

---

## 🚀 BAŞARILI TEST SONUCU

Eğer tüm adımlar başarılı olduysa:

✅ Kullanıcı kaydedildi
✅ Eski şifre ile login yapılabildi
✅ Token oluşturuldu
✅ Token geçerli
✅ Şifre sıfırlandı
✅ Eski şifre çalışmıyor
✅ Yeni şifre çalışıyor
✅ Token tek kullanımlık çalışıyor

**🎉 Password Reset özelliği tam olarak çalışıyor!**

---

**Hazır! Swagger'da adım adım test edebilirsiniz! 🚀**








