# 🔐 Password Reset (Şifremi Unuttum) - Swagger Test Rehberi

Bu dosya, Swagger'dan password reset endpoint'lerini test ederken kullanabileceğiniz hazır request body örneklerini içerir.

---

## 📋 Test Senaryoları ve Body'ler

### ✅ TEST 1: Şifre Sıfırlama Token'ı İste (Forgot Password)

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "test@example.com"
}
```

**Alternatif Test Email'leri:**
```json
{
  "email": "user@test.com"
}
```

```json
{
  "email": "admin@example.com"
}
```

**Beklenen Response:**
```json
{
  "message": "Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi.",
  "token": "550e8400-e29b-41d4-a716-446655440000"
}
```

**⚠️ NOT:** 
- Development modunda token response'da döner
- Production'da token email ile gönderilir, response'da dönmez
- Email kayıtlı değilse bile aynı mesaj döner (güvenlik için)

**Rate Limit:** 5 dakikada maksimum 5 istek

---

### ✅ TEST 2: Token Geçerliliğini Kontrol Et

**Endpoint:** `GET /api/auth/reset-password/validate`

**Query Parameter:**
```
token=550e8400-e29b-41d4-a716-446655440000
```

**Tam URL Örneği:**
```
GET /api/auth/reset-password/validate?token=550e8400-e29b-41d4-a716-446655440000
```

**Beklenen Response (Geçerli Token):**
```json
{
  "valid": true
}
```

**Beklenen Response (Geçersiz/Expired Token):**
```json
{
  "valid": false
}
```

**Test Senaryoları:**
1. ✅ Geçerli token → `valid: true`
2. ❌ Expired token → `valid: false`
3. ❌ Kullanılmış token → `valid: false`
4. ❌ Olmayan token → `valid: false`

---

### ✅ TEST 3: Şifreyi Sıfırla (Reset Password)

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Alternatif Test Body'leri:**

**Güçlü Şifre:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "StrongPass123!@#",
  "confirmPassword": "StrongPass123!@#"
}
```

**Orta Güçlü Şifre:**
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "MyNewPassword2024",
  "confirmPassword": "MyNewPassword2024"
}
```

**Beklenen Response (Başarılı):**
```json
{
  "message": "Şifreniz başarıyla güncellendi."
}
```

**Rate Limit:** 5 dakikada maksimum 5 istek

---

## 🔄 Tam Test Akışı (Step-by-Step)

### Adım 1: Token İste
```json
POST /api/auth/forgot-password
{
  "email": "test@example.com"
}
```

**Response'dan token'ı kopyala:**
```json
{
  "message": "...",
  "token": "550e8400-e29b-41d4-a716-446655440000"  ← Bu token'ı kopyala
}
```

---

### Adım 2: Token'ı Doğrula (Opsiyonel)
```
GET /api/auth/reset-password/validate?token=550e8400-e29b-41d4-a716-446655440000
```

**Beklenen:**
```json
{
  "valid": true
}
```

---

### Adım 3: Şifreyi Sıfırla
```json
POST /api/auth/reset-password
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Beklenen:**
```json
{
  "message": "Şifreniz başarıyla güncellendi."
}
```

---

### Adım 4: Yeni Şifre ile Login Test Et
```json
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "newpass123"
}
```

**Beklenen:** ✅ Login başarılı

---

## ❌ Hata Senaryoları Test Body'leri

### Hata 1: Geçersiz Email Formatı
```json
POST /api/auth/forgot-password
{
  "email": "invalid-email"
}
```

**Beklenen Hata:**
```json
{
  "code": "4000",
  "message": "Geçerli bir email adresi girin"
}
```

---

### Hata 2: Boş Email
```json
POST /api/auth/forgot-password
{
  "email": ""
}
```

**Beklenen Hata:**
```json
{
  "code": "4000",
  "message": "Email gerekli"
}
```

---

### Hata 3: Geçersiz Token ile Reset
```json
POST /api/auth/reset-password
{
  "token": "invalid-token-123",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Beklenen Hata:**
```json
{
  "code": "1011",
  "message": "Geçersiz şifre sıfırlama linki"
}
```

---

### Hata 4: Süresi Dolmuş Token
```json
POST /api/auth/reset-password
{
  "token": "expired-token-here",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Beklenen Hata:**
```json
{
  "code": "1012",
  "message": "Şifre sıfırlama linki süresi dolmuş"
}
```

---

### Hata 5: Kullanılmış Token
```json
POST /api/auth/reset-password
{
  "token": "already-used-token",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Beklenen Hata:**
```json
{
  "code": "1013",
  "message": "Bu şifre sıfırlama linki zaten kullanılmış"
}
```

---

### Hata 6: Şifreler Eşleşmiyor
```json
POST /api/auth/reset-password
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "newpass123",
  "confirmPassword": "differentpass456"
}
```

**Beklenen Hata:**
```json
{
  "code": "1007",
  "message": "Şifreler eşleşmiyor"
}
```

---

### Hata 7: Şifre Çok Kısa
```json
POST /api/auth/reset-password
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "newPassword": "123",
  "confirmPassword": "123"
}
```

**Beklenen Hata:**
```json
{
  "code": "4000",
  "message": "Şifre 6-100 karakter arasında olmalı"
}
```

---

### Hata 8: Boş Token
```json
POST /api/auth/reset-password
{
  "token": "",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Beklenen Hata:**
```json
{
  "code": "4000",
  "message": "Token gerekli"
}
```

---

## 📝 Swagger'da Test Etme Adımları

### 1. Swagger UI'ı Aç
```
http://localhost:8080/swagger-ui.html
```

### 2. Auth Controller'ı Bul
- `/api/auth` endpoint'lerini bulun

### 3. Test Sırası:
1. ✅ `POST /api/auth/forgot-password` → Token al
2. ✅ `GET /api/auth/reset-password/validate` → Token'ı doğrula (opsiyonel)
3. ✅ `POST /api/auth/reset-password` → Şifreyi sıfırla
4. ✅ `POST /api/auth/login` → Yeni şifre ile login test et

---

## 🔍 Önemli Notlar

1. **Token Süresi:** Token'lar 24 saat geçerlidir
2. **Token Tek Kullanımlık:** Bir token kullanıldıktan sonra tekrar kullanılamaz
3. **Rate Limiting:** 
   - `forgot-password`: 5 dakikada max 5 istek
   - `reset-password`: 5 dakikada max 5 istek
4. **Güvenlik:** Email kayıtlı değilse bile aynı mesaj döner (email enumeration önleme)
5. **Production:** Production'da token response'da dönmez, email ile gönderilir

---

## 🎯 Hızlı Test Senaryosu

**1. Token İste:**
```json
POST /api/auth/forgot-password
{
  "email": "test@example.com"
}
```

**2. Response'dan token'ı kopyala ve şifreyi sıfırla:**
```json
POST /api/auth/reset-password
{
  "token": "<response-dan-aldığın-token>",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**3. Yeni şifre ile login:**
```json
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "newpass123"
}
```

✅ **Başarılı!**

---

## 📊 Test Checklist

- [ ] Forgot password endpoint çalışıyor
- [ ] Token response'da dönüyor (dev mode)
- [ ] Token validation endpoint çalışıyor
- [ ] Reset password endpoint çalışıyor
- [ ] Şifre başarıyla güncelleniyor
- [ ] Yeni şifre ile login yapılabiliyor
- [ ] Geçersiz token hatası veriyor
- [ ] Expired token hatası veriyor
- [ ] Kullanılmış token hatası veriyor
- [ ] Şifre eşleşme kontrolü çalışıyor
- [ ] Validation hataları çalışıyor
- [ ] Rate limiting çalışıyor

---

**Hazır! Swagger'da test edebilirsiniz! 🚀**


