# 🛍️ Commerce Monorepo

> **Full-stack E-Commerce Platform** with Spring Boot & Next.js  
> Production-ready backend with 57+ Java files, JWT authentication, and S3 storage integration

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Java](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.10-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Progress](https://img.shields.io/badge/Progress-70%25-yellow)

---

## 📊 Project Status - October 2025

**OVERALL COMPLETION: 70%** 🎯

```
Backend API:           ████████████ 95%  ✅
Authentication:        ███████████░ 90%  ✅
Cart Management:       ███████████░ 90%  ✅
Order Management:      ███████████░ 90%  ✅
Product Management:    ████████████ 100% ✅
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

### ✅ **Backend (95% Complete)**

#### **57 Java Files Implemented:**

**Domain Layer (11 files)**
- ✅ User, UserRole - User management with role-based access
- ✅ Product - Complete product catalog
- ✅ Cart, CartItem, CartStatus - Shopping cart system
- ✅ Order, OrderItem, OrderStatus - Order processing
- ✅ Address - Address management
- ✅ BaseEntity - Base entity for all models

**DTO Layer (16 files)**
- ✅ Auth DTOs (AuthRequest, AuthResponse, LoginRequest, RegisterRequest)
- ✅ Product DTOs (Create, Update, Response)
- ✅ Cart DTOs (CartDto, CartItemDto, AddToCart, UpdateCartItem)
- ✅ Order DTOs (OrderDto, OrderItemDto, CreateOrder)
- ✅ User DTOs

**Repository Layer (6 files)**
- ✅ JPA Repositories for all entities
- ✅ Custom queries and specifications

**Service Layer (5 files)**
- ✅ AuthService - JWT-based authentication
- ✅ ProductService - Product CRUD operations
- ✅ CartService - Shopping cart business logic
- ✅ OrderService - Order processing
- ✅ EntityTenantSetter - Multi-tenant support (configurable)

**Controller Layer (10 files)**
- ✅ AuthController - `/api/auth/*` endpoints
- ✅ ProductController - `/api/products/*` endpoints
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

### **Product Management** 📦
- Full CRUD operations
- Image upload with S3/MinIO
- Presigned URLs for secure file access
- Product search and filtering
- Stock management

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
- Flyway migrations
- JPA/Hibernate ORM
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
📄 Swagger/OpenAPI
🐳 Docker & Docker Compose
🦅 Flyway Migrations
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
│       │   ├── domain/         # Entity models (11 files)
│       │   ├── dto/            # Data Transfer Objects (16 files)
│       │   ├── repo/           # JPA Repositories (6 files)
│       │   ├── service/        # Business logic (5 files)
│       │   ├── security/       # JWT & Security (6 files)
│       │   ├── storage/        # S3 integration (3 files)
│       │   └── web/            # REST Controllers (10 files)
│       └── src/main/resources/
│           ├── application.yml
│           └── db/migration/   # Flyway migrations
└── apps/
    └── web/                    # Next.js Frontend (Planned)
```

---

## 🚀 Quick Start

### **Prerequisites**
- Java 21+
- Docker & Docker Compose
- Maven 3.8+

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
mvn spring-boot:run
```

### **4. Access Services**
- **API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **MinIO Console:** http://localhost:9001 (admin/admin123)
- **PostgreSQL:** localhost:5432 (postgres/postgres)

---

## 📚 API Documentation

### **Authentication**
```http
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login
POST   /api/auth/refresh     # Refresh token
```

### **Products**
```http
GET    /api/products              # List products
GET    /api/products/{id}         # Get product
POST   /api/products              # Create product (Admin)
PUT    /api/products/{id}         # Update product (Admin)
DELETE /api/products/{id}         # Delete product (Admin)
POST   /api/products/{id}/image   # Upload image (Admin)
```

### **Cart**
```http
GET    /api/cart                  # Get user cart
POST   /api/cart/items            # Add item to cart
PUT    /api/cart/items/{id}       # Update cart item
DELETE /api/cart/items/{id}       # Remove item
POST   /api/cart/checkout         # Checkout
```

### **Orders**
```http
GET    /api/orders                # List user orders
GET    /api/orders/{id}           # Get order details
POST   /api/orders                # Create order
PUT    /api/orders/{id}/status    # Update status (Admin)
```

### **Assets**
```http
POST   /api/assets/upload         # Upload file
GET    /api/assets/download/{key} # Download file
GET    /api/assets/presigned      # Get presigned URL
```

**Full API documentation:** http://localhost:8080/swagger-ui.html

---

## 🔧 Configuration

### **Database (PostgreSQL)**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/commerce
    username: postgres
    password: postgres
```

### **Storage (MinIO/S3)**
```yaml
aws:
  s3:
    endpoint: http://localhost:9000
    access-key: minioadmin
    secret-key: minioadmin
    bucket-name: commerce-storage
```

### **JWT Configuration**
```yaml
jwt:
  secret: your-secret-key-here
  expiration: 86400000  # 24 hours
```

---

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=ProductServiceTest

# Run with coverage
mvn test jacoco:report
```

---

## 📦 Database Migrations

Using **Flyway** for version control:

```
src/main/resources/db/migration/
├── V1__init_schema.sql
├── V2__add_cart_tables.sql
├── V3__add_order_tables.sql
└── V4__add_indexes.sql
```

Apply migrations:
```bash
mvn flyway:migrate
```

---

## 🛣️ Roadmap

### **Phase 1: Backend Completion** ✅ (95% Done)
- [x] Product CRUD
- [x] User Management
- [x] Authentication & Authorization
- [x] Cart System
- [x] Order Management
- [x] File Upload (S3)
- [ ] Payment Integration (İyzico)

### **Phase 2: Frontend Development** 📋 (Upcoming)
- [ ] Next.js 14 setup
- [ ] Product catalog UI
- [ ] Shopping cart interface
- [ ] Checkout flow
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
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=commerce-storage

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

- **Total Java Files:** 57
- **Lines of Code:** ~8,500+
- **API Endpoints:** 30+
- **Database Tables:** 10
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

1. ✅ **Backend stabilization** - Bug fixes and optimizations
2. 🚧 **Payment integration** - İyzico API integration
3. 📋 **Frontend kickoff** - Next.js setup and first components
4. 📋 **Testing expansion** - Increase coverage to 60%+

---

## 🌟 Highlights

✨ **Production-Ready Architecture**  
- Clean separation of concerns
- RESTful API design
- Comprehensive error handling

✨ **Modern Tech Stack**  
- Java 21 features
- Spring Boot 3.4.10
- PostgreSQL 16

✨ **Security First**  
- JWT authentication
- Role-based access
- Secure file handling

✨ **Scalable Infrastructure**  
- Docker support
- Database migrations
- Cloud-ready (S3/MinIO)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

Made with ❤️ by Özgür

</div>
