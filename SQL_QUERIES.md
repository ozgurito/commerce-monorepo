# 🔍 SQL Sorguları - Cart Variant Kontrolü

## 📋 Hızlı Komutlar (PowerShell)

### Yöntem 1: psql ile (eğer yüklüyse)
```powershell
$env:PGPASSWORD = "postgres"
psql -h localhost -p 5432 -U postgres -d commerce
```

### Yöntem 2: Docker Container ile
```powershell
# Container adını kontrol et
docker ps | Select-String postgres

# commerce-db varsa:
docker exec -it commerce-db psql -U postgres -d commerce

# commerce-postgres varsa:
docker exec -it commerce-postgres psql -U postgres -d commerce
```

---

## 🔍 Önemli SQL Sorguları

### 1. Aktif Variant'ları Listele
```sql
SELECT 
    pv.id as variant_id,
    p.id as product_id,
    p.name as product_name,
    pv.name as variant_name,
    pv.variant_type,
    pv.size,
    pv.color,
    pv.stock as variant_stock,
    p.stock as product_stock,
    pv.price_modifier,
    p.price as product_price,
    (p.price + COALESCE(pv.price_modifier, 0)) as final_price,
    pv.is_active
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
WHERE pv.is_active = true
ORDER BY p.id, pv.id
LIMIT 10;
```

### 2. Sepetteki Item'ları Kontrol Et
```sql
SELECT 
    ci.id as cart_item_id,
    ci.cart_id,
    u.email as user_email,
    p.id as product_id,
    p.name as product_name,
    pv.id as variant_id,
    pv.name as variant_name,
    pv.size,
    pv.color,
    ci.quantity,
    ci.unit_price,
    ci.total_price,
    ci.created_at
FROM cart_items ci
JOIN carts c ON c.id = ci.cart_id
JOIN users u ON u.id = c.user_id
JOIN products p ON p.id = ci.product_id
LEFT JOIN product_variants pv ON pv.id = ci.product_variant_id
ORDER BY ci.id DESC
LIMIT 10;
```

### 3. Migration V36 Kontrolü (product_variant_id kolonu)
```sql
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND column_name = 'product_variant_id';
```

### 4. Constraint Kontrolü
```sql
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cart_items'
AND constraint_type IN ('UNIQUE', 'FOREIGN KEY');
```

### 5. Test Variant Oluştur (Eğer yoksa)
```sql
-- Önce bir ürün ID'si bul
SELECT id, name, price, stock FROM products WHERE is_active = true LIMIT 5;

-- Sonra variant ekle (product_id'yi yukarıdaki sorgudan al)
INSERT INTO product_variants (
    product_id, 
    name, 
    variant_type, 
    size, 
    color, 
    sku, 
    stock, 
    price_modifier, 
    is_active
) VALUES 
  (1, 'M - Mavi', 'SIZE_COLOR', 'M', 'Mavi', 'VAR-001', 50, 0.00, true),
  (1, 'L - Mavi', 'SIZE_COLOR', 'L', 'Mavi', 'VAR-002', 30, 10.00, true),
  (1, 'XL - Kırmızı', 'SIZE_COLOR', 'XL', 'Kırmızı', 'VAR-003', 20, 15.00, true);
```

### 6. Variant Olmayan Ürünleri Bul
```sql
SELECT 
    p.id,
    p.name,
    p.price,
    p.stock,
    COUNT(pv.id) as variant_count
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.price, p.stock
HAVING COUNT(pv.id) = 0
LIMIT 10;
```

### 7. Variant'ı Olan Ürünleri Bul
```sql
SELECT 
    p.id,
    p.name,
    p.price,
    COUNT(pv.id) as variant_count
FROM products p
JOIN product_variants pv ON pv.product_id = p.id AND pv.is_active = true
WHERE p.is_active = true
GROUP BY p.id, p.name, p.price
HAVING COUNT(pv.id) > 0
ORDER BY variant_count DESC
LIMIT 10;
```

---

## 🚀 PowerShell Tek Satır Komutları

### Tüm Variant'ları Göster
```powershell
docker exec -i commerce-db psql -U postgres -d commerce -c "SELECT pv.id, p.id as product_id, p.name, pv.name as variant_name, pv.size, pv.color, pv.stock FROM product_variants pv JOIN products p ON p.id = pv.product_id WHERE pv.is_active = true LIMIT 10;"
```

### Sepetteki Item'ları Göster
```powershell
docker exec -i commerce-db psql -U postgres -d commerce -c "SELECT ci.id, p.name, pv.name as variant, ci.quantity, ci.unit_price FROM cart_items ci JOIN products p ON p.id = ci.product_id LEFT JOIN product_variants pv ON pv.id = ci.product_variant_id ORDER BY ci.id DESC LIMIT 5;"
```

### Migration Kontrolü
```powershell
docker exec -i commerce-db psql -U postgres -d commerce -c "SELECT column_name FROM information_schema.columns WHERE table_name = 'cart_items' AND column_name = 'product_variant_id';"
```

---

## 📝 Notlar

- Container adı `commerce-db` veya `commerce-postgres` olabilir
- Şifre: `postgres`
- Database: `commerce`
- Port: `5432`

