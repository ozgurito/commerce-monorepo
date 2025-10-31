# 🛒 E-Ticaret Platformu

Modern, ölçeklenebilir full-stack e-ticaret uygulaması.

## 🚀 Teknoloji Stack

### Backend
- **Java 21** - Modern Java özellikleri
- **Spring Boot 3.4.10** - Framework
- **PostgreSQL 16** - Veritabanı
- **Flyway** - Database migrations
- **MinIO/S3** - Dosya depolama
- **Spring Security** - Güvenlik
- **JWT** - Authentication (geliştirme aşamasında)

### Frontend (Planlanan)
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## ✅ Tamamlanan Özellikler

- ✅ **Product CRUD** - Ürün yönetimi
- ✅ **File Upload/Download** - S3 entegrasyonu ile dosya yönetimi
- ✅ **Presigned URLs** - Güvenli dosya upload/download
- ✅ **Exception Handling** - Global hata yönetimi
- ✅ **Validation** - Veri doğrulama
- ✅ **Database Migrations** - Flyway ile schema yönetimi

## 🚧 Geliştirme Aşamasında

- 🚧 **Authentication** - JWT tabanlı kimlik doğrulama
- 🚧 **Shopping Cart** - Alışveriş sepeti
- 🚧 **Order Management** - Sipariş yönetimi
- 🚧 **Payment Integration** - İyzico ödeme entegrasyonu
- 🚧 **Admin Panel** - Yönetim paneli

## 📦 Kurulum

### Gereksinimler
- Java 21+
- PostgreSQL 16+
- MinIO (veya AWS S3)
- Gradle 8+

### 1. Database Kurulumu
```bash
# Docker ile PostgreSQL
docker run -d \
  --name commerce-db \
  -p 5432:5432 \
  -e POSTGRES_DB=commerce \
  -e POSTGRES_USER=commerce \
  -e POSTGRES_PASSWORD=secret \
  postgres:16
```

### 2. MinIO Kurulumu (Development)
```bash
# Docker ile MinIO
docker run -d \
  --name commerce-minio \
  -p 9000:9000 \
  -p 9001:9001 \
  -e MINIO_ROOT_USER=minio \
  -e MINIO_ROOT_PASSWORD=minio123 \
  minio/minio server /data --console-address ":9001"

# MinIO Console: http://localhost:9001
# Kullanıcı: minio / minio123
```

### 3. Uygulamayı Çalıştırma
```bash
cd services/api
./gradlew bootRun

# Veya Windows:
.\gradlew.bat bootRun
```

## 🔗 API Endpoints

### Health Check
```
GET http://localhost:8080/health
GET http://localhost:8080/actuator/health
```

### Swagger UI
```
http://localhost:8080/swagger-ui.html
```

### Products
```
GET    /api/products           # Tüm ürünleri listele
GET    /api/products/{id}      # Ürün detayı
POST   /api/products           # Yeni ürün oluştur
PUT    /api/products/{id}      # Ürün güncelle
DELETE /api/products/{id}      # Ürün sil
```

### File Upload/Download
```
POST /assets/upload-url         # Upload URL al
POST /assets/download-url       # Download URL al
```

## 🧪 Test

### Product Oluşturma
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Ürün",
    "description": "Test açıklama",
    "price": 99.99,
    "stock": 10
  }'
```

### File Upload
```powershell
# 1. Upload URL al
$req = @{ key = ""; contentType = "image/jpeg" } | ConvertTo-Json
$res = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/assets/upload-url" -ContentType "application/json" -Body $req

# 2. Dosyayı yükle
$hdr = @{}
foreach ($k in $res.headers.PSObject.Properties.Name) {
    if ($k -ne 'host') { $hdr[$k] = ($res.headers.$k | Select-Object -First 1) }
}
Invoke-WebRequest -Method Put -Uri $res.url -InFile "dosya.jpg" -Headers $hdr -ContentType "image/jpeg"

# 3. Download URL al
$downloadReq = @{ key = $res.key } | ConvertTo-Json
$downloadRes = Invoke-RestMethod -Method Post -Uri "http://localhost:8080/assets/download-url" -ContentType "application/json" -Body $downloadReq
```

## 🗂️ Proje Yapısı
```
commerce-monorepo/
├── services/
│   └── api/                          # Spring Boot Backend
│       ├── src/main/java/com/commerce/api/
│       │   ├── config/              # Konfigürasyonlar
│       │   ├── domain/              # Entity sınıfları
│       │   ├── dto/                 # Data Transfer Objects
│       │   ├── repo/                # Repository interfaces
│       │   ├── security/            # Security & JWT
│       │   ├── service/             # Business logic
│       │   ├── storage/             # S3/MinIO integration
│       │   └── web/                 # REST Controllers
│       └── src/main/resources/
│           ├── application.properties
│           └── db/migration/        # Flyway migrations
└── apps/
    └── web/                         # Next.js Frontend (yakında)
```

## 🔐 Environment Variables

Production ortamı için environment variables kullanın:
```bash
# Database
DATABASE_URL=jdbc:postgresql://host:5432/commerce
DATABASE_USER=commerce
DATABASE_PASSWORD=your-secure-password

# S3/MinIO
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=your-bucket-name
S3_REGION=eu-central-1

# Security
ADMIN_USER=admin
ADMIN_PASSWORD=secure-password
JWT_SECRET=your-jwt-secret-key

# İyzico (yakında)
IYZICO_API_KEY=your-api-key
IYZICO_SECRET_KEY=your-secret-key
```

## 📊 İlerleme Durumu

**Toplam İlerleme: %60**

| Özellik | Durum | Tamamlanma |
|---------|-------|------------|
| Product CRUD | ✅ Tamamlandı | %100 |
| File Upload | ✅ Tamamlandı | %100 |
| Authentication | 🚧 Devam Ediyor | %30 |
| Shopping Cart | 📋 Planlandı | %0 |
| Orders | 📋 Planlandı | %0 |
| Payment | 📋 Planlandı | %0 |
| Frontend | 📋 Planlandı | %0 |

## 👨‍💻 Geliştirici

**Özgür Öztürk**
- GitHub: [@ozgurito](https://github.com/ozgurito)
- GitLab: [@uz.ozturk](https://gitlab.com/uz.ozturk)

## 📝 Lisans

Private Project - Tüm hakları saklıdır.

---

**Son Güncelleme:** 24 Ekim 2025
**Versiyon:** 0.1.0 (MVP Development)