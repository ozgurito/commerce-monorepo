# E-Commerce Monorepo Backend

📊 **Proje Özeti**  
Modern, ölçeklenebilir e-ticaret backend sistemi.

## 🚀 Özellikler

* ✅ JWT Authentication & Authorization
* ✅ Product Management (CRUD + Category Assignment)
* ✅ Category Management (Hierarchical)
* ✅ Shopping Cart System
* ✅ Order Management (Full CRUD + Status Transitions)
* ✅ Custom Design Workflow (Business Rules)
* ✅ Review & Rating System
* ✅ Credit System
* ✅ Asset Management (S3/MinIO)
* ✅ User Management (DTO Pattern + Validation)

## 📈 Test Coverage

* **Toplam Endpoint:** 55+
* **Test Edilen:** 55+ (100%)
* **Başarı Oranı:** 100%

### Test Edilen Kritik Özellikler:
- ✅ User creation (DTO pattern + validation)
- ✅ Product category assignment
- ✅ Order creation (cascade handling)
- ✅ Order status transitions (PENDING→PAID→PROCESSING→CANCELLED)
- ✅ CustomDesign business rules
- ✅ Migration (fullName unique constraint removed)

## 🛠️ Teknolojiler

* Spring Boot 3.4.10
* PostgreSQL 16
* JWT Authentication (HS384)
* MinIO/S3
* Maven
* Flyway Migration
* Hibernate 6.3.1

## 🏗️ Architecture

* **DTO Pattern** - Request/Response separation
* **Service Layer** - Business logic isolation
* **Repository Pattern** - Data access layer
* **Clean Code** - SOLID principles
* **Validation** - Bean Validation (JSR-380)
* **Security** - Role-based access control

## 📝 Dokümantasyon

* **Swagger UI:** http://localhost:8080/swagger-ui.html
* **API Docs:** http://localhost:8080/v3/api-docs

## 🔧 Kurulum
```bash
# Database başlat
docker-compose -f infra/docker/compose.local.yml up -d

# Not: PostgreSQL host portu 5433 olarak açılır (container içi 5432).

# Uygulamayı çalıştır
mvn spring-boot:run
```

## ✅ Son Güncelleme (14 Kasım 2025)

### Çözülen Sorunlar:
1. ✅ Migration V31 - fullName unique constraint kaldırıldı
2. ✅ User creation - Password NULL sorunu (DTO pattern)
3. ✅ Product category assignment - Category mapping
4. ✅ Order creation - Hibernate cascade sorunu
5. ✅ OrderItem - Column mapping (total_amount)
6. ✅ CustomDesign reject - Business rule
7. ✅ Validation - DTO seviyesinde validation

### Teknik İyileştirmeler:
- CreateUserRequest DTO eklendi
- UserService katmanı oluşturuldu
- Order entity field mapping düzeltildi
- OrderItem nullable constraint kaldırıldı
- Bidirectional relationship helper methods
- Circular reference sorunları çözüldü

## 📞 İletişim

**GitLab:** https://gitlab.com/uz.ozturk/commerce-monorepo