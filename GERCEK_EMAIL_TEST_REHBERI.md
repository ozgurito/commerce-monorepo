# 📧 GERÇEK EMAIL İLE TEST REHBERİ

## 🎯 Gmail SMTP ile Gerçek Email Gönderme

Bu rehber, Gmail SMTP kullanarak gerçek email göndermek için tüm adımları içerir.

---

## 📋 ADIM 1: GMAIL APP PASSWORD OLUŞTURMA

### 1.1 Google Hesabınıza Giriş Yapın
- https://myaccount.google.com adresine gidin
- Google hesabınızla giriş yapın

### 1.2 2 Adımlı Doğrulamayı Aktif Edin
1. **Güvenlik** sekmesine gidin
2. **2 Adımlı Doğrulama** bölümünü bulun
3. Eğer aktif değilse, **Açık** yapın
4. Telefon numaranızı doğrulayın

**ÖNEMLİ:** App Password oluşturmak için 2 Adımlı Doğrulama **ZORUNLUDUR**!

### 1.3 App Password Oluşturun
1. **Güvenlik** sekmesinde **2 Adımlı Doğrulama** bölümüne gidin
2. Sayfanın altında **Uygulama şifreleri** linkini bulun
3. **Uygulama şifreleri** sayfasına gidin
4. **Uygulama seçin** dropdown'ından **Mail** seçin
5. **Cihaz seçin** dropdown'ından **Diğer (Özel ad)** seçin
6. İsim verin: `Commerce App` veya `E-commerce Backend`
7. **Oluştur** butonuna tıklayın
8. **16 haneli şifre** gösterilecek - **HEMEN KOPYALAYIN!**
   - Format: `xxxx xxxx xxxx xxxx` (boşluklu)
   - Veya: `xxxxxxxxxxxxxxxx` (boşluksuz)

**ÖNEMLİ:** Bu şifreyi bir daha göremezsiniz! Not alın.

---

## 📋 ADIM 2: APPLICATION.PROPERTIES AYARLARI

### 2.1 Dosyayı Açın
`src/main/resources/application.properties` dosyasını açın

### 2.2 Email Ayarlarını Güncelleyin

**MEVCUT AYARLAR:**
```properties
# ==============================
# Email / SMTP
# ==============================
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:your-email@gmail.com}
spring.mail.password=${MAIL_PASSWORD:your-app-password}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# App email settings
app.email.from=${APP_EMAIL_FROM:noreply@yourstore.com}
app.email.from-name=${APP_EMAIL_FROM_NAME:Your Store}
app.frontend-url=${FRONTEND_URL:http://localhost:3000}
```

### 2.3 YÖNTEM 1: Environment Variables (ÖNERİLEN - Production için)

**Windows PowerShell:**
```powershell
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="xxxx xxxx xxxx xxxx"
$env:APP_EMAIL_FROM="your-email@gmail.com"
$env:APP_EMAIL_FROM_NAME="Your Store"
$env:FRONTEND_URL="http://localhost:3000"
```

**Windows CMD:**
```cmd
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=587
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=xxxx xxxx xxxx xxxx
set APP_EMAIL_FROM=your-email@gmail.com
set APP_EMAIL_FROM_NAME=Your Store
set FRONTEND_URL=http://localhost:3000
```

**Linux/Mac:**
```bash
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD="xxxx xxxx xxxx xxxx"
export APP_EMAIL_FROM=your-email@gmail.com
export APP_EMAIL_FROM_NAME="Your Store"
export FRONTEND_URL=http://localhost:3000
```

### 2.4 YÖNTEM 2: application.properties'e Direkt Yazma (Sadece Test için)

**⚠️ UYARI:** Bu yöntem sadece local test için kullanılmalıdır. Git'e commit etmeyin!

```properties
# ==============================
# Email / SMTP
# ==============================
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=xxxx xxxx xxxx xxxx
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

# App email settings
app.email.from=your-email@gmail.com
app.email.from-name=Your Store
app.frontend-url=http://localhost:3000
```

**ÖNEMLİ:** 
- `your-email@gmail.com` → Gmail adresiniz
- `xxxx xxxx xxxx xxxx` → App Password (16 haneli, boşluklu veya boşluksuz)

---

## 📋 ADIM 3: .GITIGNORE KONTROLÜ

### 3.1 .gitignore Dosyasını Kontrol Edin

Eğer `application.properties`'e direkt yazdıysanız, şifrelerin Git'e commit edilmemesi için:

**`.gitignore` dosyasına ekleyin:**
```
# Email credentials (if hardcoded for testing)
# application.properties
```

**VEYA** `application-local.properties` oluşturun ve `.gitignore`'a ekleyin:
```
application-local.properties
```

---

## 📋 ADIM 4: UYGULAMAYI ÇALIŞTIRMA

### 4.1 Environment Variables ile (ÖNERİLEN)

**Windows PowerShell:**
```powershell
# Environment variables'ları ayarla (yukarıdaki gibi)
# Sonra uygulamayı çalıştır
mvn spring-boot:run
```

**Linux/Mac:**
```bash
# Environment variables'ları ayarla (yukarıdaki gibi)
# Sonra uygulamayı çalıştır
mvn spring-boot:run
```

### 4.2 IDE ile Çalıştırma

**IntelliJ IDEA:**
1. Run Configuration oluşturun
2. **Environment variables** bölümüne ekleyin:
   ```
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=xxxx xxxx xxxx xxxx
   APP_EMAIL_FROM=your-email@gmail.com
   APP_EMAIL_FROM_NAME=Your Store
   FRONTEND_URL=http://localhost:3000
   ```

**VS Code:**
1. `.vscode/launch.json` dosyası oluşturun:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "Spring Boot App",
      "request": "launch",
      "mainClass": "com.commerce.monorepo.MonorepoApplication",
      "env": {
        "MAIL_HOST": "smtp.gmail.com",
        "MAIL_PORT": "587",
        "MAIL_USERNAME": "your-email@gmail.com",
        "MAIL_PASSWORD": "xxxx xxxx xxxx xxxx",
        "APP_EMAIL_FROM": "your-email@gmail.com",
        "APP_EMAIL_FROM_NAME": "Your Store",
        "FRONTEND_URL": "http://localhost:3000"
      }
    }
  ]
}
```

---

## 📋 ADIM 5: TEST ETME

### 5.1 Uygulamayı Başlatın
```bash
mvn spring-boot:run
```

### 5.2 Logları Kontrol Edin

Uygulama başlarken şu logları görmelisiniz:
```
INFO  - Starting MonorepoApplication
INFO  - Started MonorepoApplication in X seconds
```

**Email gönderiminde:**
```
INFO  - Password reset email sent to: test@example.com
INFO  - Order confirmation email sent for order: ORD-XXX
```

**Hata durumunda:**
```
ERROR - Failed to send email: Authentication failed
```

### 5.3 İlk Test: Register Endpoint

**Swagger'da:**
1. `POST /api/auth/register` endpoint'ini açın
2. Request body:
```json
{
  "email": "test@example.com",
  "password": "test123456",
  "fullName": "Test Kullanıcı"
}
```
3. Execute butonuna tıklayın
4. **Email kutusunu kontrol edin!**

**Gmail'de kontrol:**
- Gelen kutusu
- Spam klasörü
- "Hoş Geldiniz!" başlıklı email

---

## 🐛 SIK KARŞILAŞILAN HATALAR VE ÇÖZÜMLERİ

### Hata 1: "Authentication failed"
**Sebep:** App Password yanlış veya 2 Adımlı Doğrulama aktif değil

**Çözüm:**
1. 2 Adımlı Doğrulama'nın aktif olduğundan emin olun
2. Yeni bir App Password oluşturun
3. Şifreyi doğru kopyaladığınızdan emin olun (boşluklar dahil)

### Hata 2: "Connection timeout"
**Sebep:** Firewall veya network sorunu

**Çözüm:**
1. Port 587'nin açık olduğundan emin olun
2. VPN kullanıyorsanız kapatın
3. Antivirus firewall ayarlarını kontrol edin

### Hata 3: "535-5.7.8 Username and Password not accepted"
**Sebep:** Gmail hesabı "Less secure app access" gerektiriyor (eski hesaplar)

**Çözüm:**
1. App Password kullanın (2 Adımlı Doğrulama ile)
2. Normal şifre yerine App Password kullanın

### Hata 4: Email gelmiyor
**Sebep:** Email gönderildi ama spam'a düştü veya async çalışıyor

**Çözüm:**
1. Spam klasörünü kontrol edin
2. 5-10 saniye bekleyin (async)
3. Logları kontrol edin (hata var mı?)

---

## ✅ BAŞARILI TEST KONTROL LİSTESİ

- [ ] Gmail App Password oluşturuldu
- [ ] Environment variables ayarlandı
- [ ] Uygulama başarıyla başladı
- [ ] Loglarda email hatası yok
- [ ] Register endpoint'i çalıştı
- [ ] Email Gmail'de görünüyor
- [ ] Email içeriği doğru
- [ ] Linkler çalışıyor

---

## 🔒 GÜVENLİK NOTLARI

### ✅ YAPILMASI GEREKENLER:
1. **Environment Variables kullanın** (production'da)
2. **App Password kullanın** (normal şifre değil)
3. **.gitignore'a ekleyin** (şifreler Git'e gitmesin)
4. **2 Adımlı Doğrulama aktif olsun**

### ❌ YAPILMAMASI GEREKENLER:
1. **Normal Gmail şifresini kullanmayın**
2. **Şifreleri Git'e commit etmeyin**
3. **application.properties'e şifre yazmayın** (production'da)
4. **App Password'u paylaşmayın**

---

## 📝 ÖRNEK TEST SENARYOSU

### Tam Test Akışı:

1. **Environment Variables Ayarla:**
```powershell
$env:MAIL_USERNAME="test@gmail.com"
$env:MAIL_PASSWORD="xxxx xxxx xxxx xxxx"
```

2. **Uygulamayı Başlat:**
```bash
mvn spring-boot:run
```

3. **Swagger'da Test Et:**
   - Register → Welcome email ✅
   - Forgot Password → Reset email ✅
   - Create Order → Order confirmation email ✅

4. **Gmail'i Kontrol Et:**
   - Gelen kutusu
   - Spam klasörü
   - Email içeriği

5. **Logları Kontrol Et:**
   - Hata var mı?
   - Email gönderildi mi?

---

## 🎯 HIZLI BAŞLANGIÇ (ÖZET)

```powershell
# 1. App Password oluştur (Gmail'den)
# 2. Environment variables ayarla
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="xxxx xxxx xxxx xxxx"

# 3. Uygulamayı çalıştır
mvn spring-boot:run

# 4. Swagger'da test et
# http://localhost:8080/swagger-ui.html

# 5. Email'i kontrol et
# Gmail → Gelen Kutusu
```

---

## 📞 YARDIM

Eğer sorun yaşıyorsanız:

1. **Logları kontrol edin:** `application.log` veya console
2. **Gmail App Password:** Yeniden oluşturun
3. **Port kontrolü:** 587 açık mı?
4. **Firewall:** Antivirus ayarları

**Başarılar! 🚀**

