# 🛍️ Commerce Monorepo

> **Full-stack E-Commerce Platform** with Spring Boot & Next.js  
> Production-ready backend with 87+ Java files, Advanced Product Catalog, Reviews, Custom Design, and Credit System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.10-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Progress](https://img.shields.io/badge/Progress-85%25-green)

---

## 📊 Project Status - January 2025

**OVERALL COMPLETION: 85%** 🎯

```
Backend API:           ████████████ 100% ✅
Product Management:    ████████████ 100% ✅
Category System:       ████████████ 100% ✅
Review System:         ████████████ 100% ✅
Custom Design:         ████████████ 100% ✅
Credit System:         ████████████ 100% ✅
Authentication:        ███████████░ 90%  ✅
Cart Management:       ███████████░ 90%  ✅
Order Management:      ███████████░ 90%  ✅
User Management:       ████████████ 100% ✅
File Upload/S3:        ████████████ 100% ✅
Security:              ██████████░░ 85%  ✅
Database:              ████████████ 100% ✅
Frontend:              ░░░░░░░░░░░░ 0%   📋
Payment Integration:   ░░░░░░░░░░░░ 0%   📋
Testing:               ██░░░░░░░░░░ 20%  🚧
```

---

## 🚀 What's Completed

### ✅ **Backend (100% Complete)**

#### **87+ Java Files Implemented:**

**Domain Layer (20 files)**
- ✅ User, UserRole - User management with role-based access
- ✅ Product - Advanced product catalog with variants, images, SEO
- ✅ Category - Hierarchical category system
- ✅ ProductImage, ProductVariant - Multi-image & variant support
- ✅ Review, ReviewHelpful - Product review & rating system
- ✅ Cart, CartItem, CartStatus - Shopping cart system
- ✅ Order, OrderItem, OrderStatus - Order processing
- ✅ CustomDesign - Custom design workflow
- ✅ DesignCredit, CreditTransaction - Credit management
- ✅ DesignTemplate - Design templates library
- ✅ Address - Address management
- ✅ BaseEntity - Base entity for all models

**DTO Layer (29 files)**
- ✅ Auth DTOs (AuthRequest, AuthResponse, LoginRequest, RegisterRequest)
- ✅ Category DTOs (CategoryDto, CategoryCreateRequest, CategoryUpdateRequest)
- ✅ Product DTOs (ProductDto, ProductDetailDto, ProductImageDto, ProductVariantDto)
- ✅ Review DTOs (ReviewDto, ReviewCreateRequest)
- ✅ Custom Design DTOs (CustomDesignDto, CustomDesignCreateRequest, CustomDesignUpdateRequest)
- ✅ Credit DTOs (DesignCreditDto, CreditTransactionDto)
- ✅ Cart DTOs (CartDto, CartItemDto, AddToCart, UpdateCartItem)
- ✅ Order DTOs (OrderDto, OrderItemDto, CreateOrder)
- ✅ User DTOs

**Repository Layer (15 files)**
- ✅ JPA Repositories for all entities
- ✅ Custom queries with pagination
- ✅ Advanced search & filtering

**Service Layer (9 files)**
- ✅ AuthService - JWT-based authentication
- ✅ ProductService - Advanced product management
- ✅ CategoryService - Category hierarchy management
- ✅ ReviewService - Review & rating management
- ✅ CustomDesignService - Custom design workflow
- ✅ DesignCreditService - Credit balance & transactions
- ✅ CartService - Shopping cart business logic
- ✅ OrderService - Order processing
- ✅ StorageService - S3 file management

**Controller Layer (14 files)**
- ✅ CategoryController - `/api/categories/*` endpoints
- ✅ ProductController - `/api/products/*` endpoints (advanced)
- ✅ ReviewController - `/api/reviews/*` endpoints
- ✅ CustomDesignController - `/api/custom-designs/*` endpoints
- ✅ DesignCreditController - `/api/credits/*` endpoints
- ✅ AuthController - `/api/auth/*` endpoints
- ✅ CartController - `/api/cart/*` endpoints
- ✅ OrderController - `/api/orders/*` endpoints
- ✅ UserController - `/api/users/*` endpoints
- ✅ AssetController - File upload/download
- ✅ GlobalExceptionHandler - Centralized error handling
- ✅ HealthController - Health checks

**Security Layer (6 files)**
- ✅ JWT Token Provider & Utilities
- ✅ JWT Authentication Filters
- ✅ Security Configuration
- ✅ Tenant Context & Filters

**Storage Layer (3 files)**
- ✅ S3Config - AWS S3 / MinIO configuration
- ✅ StorageService - File upload/download service
- ✅ S3BucketInitializer - Auto bucket creation

---

## 🎯 Key Features

### **Authentication & Authorization** 🔐
- JWT-based authentication
- Role-based access control (Admin, User)
- Secure password encryption
- Token refresh mechanism

### **Advanced Product Management** 📦
- Full CRUD operations with pagination
- **Hierarchical Categories** - Parent/child category structure
- **Product Variants** - Size, color, SKU-based variants
- **Multiple Images** - Primary and gallery images
- **SEO Optimization** - Meta titles, descriptions, slugs
- **Stock Management** - Low stock alerts
- **Featured Products** - Promotional products
- Image upload with S3/MinIO
- Presigned URLs for secure file access
- Product search and filtering
- Category-based filtering

### **Product Review System** ⭐
- Customer reviews with ratings (1-5 stars)
- Review approval workflow (Admin)
- Helpful/Unhelpful voting
- Admin responses to reviews
- Verified purchase badges
- Review images support
- Average rating calculation
- Review pagination

### **Custom Design System** 🎨
- **"Design It Yourself"** feature
- Custom design creation & editing
- Design templates library
- Design submission workflow
- Admin approval/rejection
- Production status tracking
- Shipping tracking integration
- Base product selection

### **Credit System** 💳
- User credit balance management
- Credit earning & spending
- Transaction history
- Membership tiers (Free, Premium, etc.)
- Tier-based discounts
- Credit expiry tracking
- Admin credit management

### **Shopping Cart** 🛒
- Add/Remove/Update items
- Cart persistence per user
- Real-time price calculations
- Cart status management (ACTIVE, CHECKED_OUT, ABANDONED)

### **Order Management** 📋
- Order creation from cart
- Order status tracking (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Order history
- Admin order management

### **File Storage** 📁
- S3/MinIO integration
- Presigned URLs for secure access
- Image optimization
- Automatic bucket initialization

### **Database** 💾
- PostgreSQL 16
- **18 Flyway migrations** (V1-V18)
- JPA/Hibernate ORM
- JSONB support for complex data
- Multi-tenant support (optional)

---

## 🛠️ Tech Stack

### **Backend**
```
☕ Java 21
🍃 Spring Boot 3.4.10
🗄️ PostgreSQL 16
📦 MinIO / AWS S3
🔐 JWT Authentication
📄 Swagger/OpenAPI 2.7.0
🐳 Docker & Docker Compose
🦅 Flyway Migrations
📊 Hypersistence Utils (JSONB)
```

### **Frontend (Planned)**
```
⚛️ Next.js 14
📘 TypeScript
🎨 Tailwind CSS
🧩 shadcn/ui
🔗 React Query
📊 Zustand (State Management)
```

---

## 📁 Project Structure

```
commerce-monorepo/
├── services/
│   └── api/                    # Spring Boot Backend
│       ├── src/main/java/com/commerce/api/
│       │   ├── config/         # Configuration files
│       │   ├── domain/         # Entity models (20 files)
│       │   ├── dto/            # Data Transfer Objects (29 files)
│       │   ├── repo/           # JPA Repositories (15 files)
│       │   ├── service/        # Business logic (9 files)
│       │   ├── security/       # JWT & Security (6 files)
│       │   ├── storage/        # S3 integration (3 files)
│       │   └── web/            # REST Controllers (14 files)
│       └── src/main/resources/
│           ├── application.properties
│           └── db/migration/   # Flyway migrations (18 files)
└── apps/
    └── web/                    # Next.js Frontend (Planned)
```

---

## 🚀 Quick Start

### **Prerequisites**
- Java 21+
- Docker & Docker Compose
- Gradle 8.14+

### **1. Clone Repository**
```bash
git clone https://github.com/ozgurito/commerce-monorepo.git
cd commerce-monorepo
```

### **2. Start Infrastructure**
```bash
docker-compose up -d
# Starts PostgreSQL + MinIO
```

### **3. Run Backend**
```bash
cd services/api
./gradlew bootRun
# OR on Windows:
gradlew.bat bootRun
```

### **4. Access Services**
- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **MinIO Console:** http://localhost:9001 (admin/admin123)
- **PostgreSQL:** localhost:5432 (postgres/postgres)

---

## 📚 API Documentation

### **Categories**
```http
GET    /api/categories                 # List all active categories
GET    /api/categories/root            # Root categories only
GET    /api/categories/{id}            # Get category
GET    /api/categories/slug/{slug}     # Get by slug
POST   /api/categories                 # Create (Admin)
PUT    /api/categories/{id}            # Update (Admin)
DELETE /api/categories/{id}            # Delete (Admin)
```

### **Products**
```http
GET    /api/products                    # List products
GET    /api/products/{id}               # Get product
GET    /api/products/category/{id}      # Products by category (paginated)
GET    /api/products/low-stock          # Low stock products (Admin)
POST   /api/products                    # Create product (Admin)
PUT    /api/products/{id}               # Update product (Admin)
DELETE /api/products/{id}               # Delete product (Admin)
```

### **Reviews**
```http
GET    /api/reviews/product/{id}        # Product reviews (paginated)
GET    /api/reviews/pending             # Pending reviews (Admin)
POST   /api/reviews                     # Create review (Auth)
PUT    /api/reviews/{id}/approve        # Approve (Admin)
PUT    /api/reviews/{id}/response       # Add admin response (Admin)
POST   /api/reviews/{id}/helpful        # Mark helpful/unhelpful (Auth)
DELETE /api/reviews/{id}                # Delete (Admin)
```

### **Custom Designs**
```http
GET    /api/custom-designs/my-designs   # My designs (Auth)
GET    /api/custom-designs/status/{status}  # By status (Admin)
POST   /api/custom-designs              # Create design (Auth)
PUT    /api/custom-designs/{id}         # Update (Auth)
POST   /api/custom-designs/{id}/submit  # Submit for review (Auth)
PUT    /api/custom-designs/{id}/approve # Approve (Admin)
PUT    /api/custom-designs/{id}/reject  # Reject (Admin)
PUT    /api/custom-designs/{id}/start-production  # Start production (Admin)
```

### **Credits**
```http
GET    /api/credits/balance             # My balance (Auth)
GET    /api/credits/transactions        # Transaction history (Auth)
POST   /api/credits/add                 # Add credits (Admin)
```

### **Authentication**
```http
POST   /api/auth/register               # Register new user
POST   /api/auth/login                  # Login
GET    /api/auth/me                     # Current user
```

### **Cart**
```http
GET    /api/cart                        # Get user cart
POST   /api/cart/items                  # Add item to cart
PUT    /api/cart/items/{id}             # Update cart item
DELETE /api/cart/items/{id}             # Remove item
```

### **Orders**
```http
GET    /api/orders                      # List user orders
GET    /api/orders/{id}                 # Get order details
POST   /api/orders                      # Create order
PUT    /api/orders/{id}/status          # Update status (Admin)
```

### **Assets**
```http
POST   /api/assets/upload               # Upload file
GET    /api/assets/download/{key}       # Download file
GET    /api/assets/presigned            # Get presigned URL
```

**Full API documentation:** http://localhost:8080/swagger-ui.html

---

## 🔧 Configuration

### **Database (PostgreSQL)**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/commerce
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

### **Flyway Migrations**
```properties
spring.flyway.enabled=true
spring.flyway.locations=classpath:db/migration
spring.flyway.baseline-on-migrate=true
spring.flyway.validate-on-migrate=true
```

### **Storage (MinIO/S3)**
```properties
storage.s3.endpoint=http://localhost:9000
storage.s3.accessKey=minio
storage.s3.secretKey=minio123
storage.s3.bucket=commerce-assets
```

### **JWT Configuration**
```properties
jwt.secret=your-secret-key-here
jwt.expiration=86400000  # 24 hours
```

### **Swagger/OpenAPI**
```properties
springdoc.api-docs.enabled=true
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.path=/swagger-ui.html
```

---

## 📦 Database Migrations

18 Flyway migrations covering the full database schema:

```
V1__init.sql                              # Base schema (users, products, orders)
V2__products_id_bigint.sql                # Convert IDs to BIGINT
V3__seed.sql                              # Initial seed data
V4__add_more_products.sql                 # Additional products
V5__constraints.sql                       # Add constraints
V6__users_id_to_bigint.sql                # Convert user IDs
V7__add_password_to_users.sql             # Add password field
V8__add_users_timestamps.sql              # Add timestamps
V9__add_tenant_id.sql                     # Multi-tenant support
V10__orders.sql                           # Orders table
V11__orders_add_tenant.sql                # Orders with tenant
V12__orders_id_to_bigint.sql              # Convert order IDs
V13__add_order_items_table.sql            # Order items
V14__add_cart_tables.sql                  # Cart system
V15__add_categories.sql                   # 🆕 Category system
V16__update_products_add_images_variants.sql  # 🆕 Product images & variants
V17__add_reviews.sql                      # 🆕 Review system
V18__add_custom_design_and_credits.sql    # 🆕 Custom design & credits
```

Apply migrations automatically on startup or manually:
```bash
./gradlew flywayMigrate
```

---

## 🧪 Testing

```bash
# Run all tests
./gradlew test

# Run specific test
./gradlew test --tests ProductServiceTest

# Run with coverage
./gradlew test jacocoTestReport
```

---

## 🛣️ Roadmap

### **Phase 1: Backend Completion** ✅ (100% Done)
- [x] Product CRUD with advanced features
- [x] Category hierarchy system
- [x] Product variants & images
- [x] Review & rating system
- [x] Custom design workflow
- [x] Credit management system
- [x] User Management
- [x] Authentication & Authorization
- [x] Cart System
- [x] Order Management
- [x] File Upload (S3)
- [ ] Payment Integration (İyzico)

### **Phase 2: Frontend Development** 📋 (Upcoming)
- [ ] Next.js 14 setup
- [ ] Product catalog UI
- [ ] Category navigation
- [ ] Shopping cart interface
- [ ] Custom design interface
- [ ] User dashboard
- [ ] Admin panel

### **Phase 3: Testing & QA** 🚧 (20% Done)
- [x] Unit tests (partial)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests

### **Phase 4: Production** 📋 (Planned)
- [ ] CI/CD pipeline
- [ ] Kubernetes deployment
- [ ] Monitoring & logging
- [ ] Performance optimization

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 Environment Variables

Create `.env` file in `services/api/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=commerce
DB_USER=postgres
DB_PASSWORD=postgres

# MinIO/S3
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_BUCKET=commerce-assets

# JWT
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRATION=86400000

# App
SERVER_PORT=8080
```

---

## 🐳 Docker Support

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build
```

---

## 📊 Project Statistics

- **Total Java Files:** 87
- **Domain Entities:** 20
- **DTOs:** 29
- **Repositories:** 15
- **Services:** 9
- **Controllers:** 14
- **Lines of Code:** ~15,000+
- **API Endpoints:** 50+
- **Database Tables:** 25+
- **Migrations:** 18
- **Test Coverage:** 20% (growing)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Backend Lead:** Özgür - Spring Boot, Database, Security
- **Frontend (Planned):** Next.js, TypeScript, UI/UX
- **DevOps (Planned):** Docker, Kubernetes, CI/CD

---

## 📞 Contact

- **GitHub:** [@ozgurito](https://github.com/ozgurito)
- **Project Link:** [commerce-monorepo](https://github.com/ozgurito/commerce-monorepo)

---

## 🎯 Current Focus

1. ✅ **Backend completion** - All core features implemented
2. 🚧 **Payment integration** - İyzico API integration
3. 📋 **Frontend kickoff** - Next.js setup and first components
4. 📋 **Testing expansion** - Increase coverage to 60%+

---

## 🌟 Highlights

✨ **Production-Ready Architecture**  
- Clean separation of concerns
- RESTful API design
- Comprehensive error handling
- Java 21 records for DTOs

✨ **Modern Tech Stack**  
- Java 21 features
- Spring Boot 3.4.10
- PostgreSQL 16 with JSONB
- Flyway migrations

✨ **Advanced E-Commerce Features**  
- Hierarchical categories
- Product variants (size, color)
- Multi-image galleries
- Review & rating system
- Custom design workflow
- Credit management

✨ **Security First**  
- JWT authentication
- Role-based access control
- Secure file handling
- Input validation

✨ **Scalable Infrastructure**  
- Docker support
- Database migrations
- Cloud-ready (S3/MinIO)
- JSONB for flexible data

---

## 🎉 Recent Additions (Latest Update)

### ✅ Categories System (V15)
- Hierarchical category structure
- Parent/child relationships
- SEO-friendly slugs
- Display ordering
- Meta titles & descriptions

### ✅ Advanced Products (V16)
- Product variants (size, color)
- Multiple image galleries
- Stock management
- Low stock alerts
- Featured products
- SEO optimization

### ✅ Review System (V17)
- Customer reviews & ratings
- Admin approval workflow
- Helpful/unhelpful voting
- Admin responses
- Verified purchase badges

### ✅ Custom Design & Credits (V18)
- Custom design creation
- Design templates library
- Production workflow
- Credit balance system
- Transaction history
- Membership tiers

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with ❤️ by Özgür

**85% Complete - Production Ready Backend** 🚀

</div>
