# PostgreSQL Bağlantı Bilgileri
$env:PGPASSWORD = "postgres"
$dbHost = "localhost"
$port = "5432"
$database = "commerce"
$user = "postgres"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PRODUCT VARIANTS KONTROLÜ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Yöntem 1: psql komutu ile (eğer yüklüyse)
Write-Host "1. Aktif Variant'ları Listele:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$query1 = @"
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
"@

# psql komutunu dene
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue
if ($psqlPath) {
    Write-Host "psql bulundu, sorgu çalıştırılıyor..." -ForegroundColor Green
    $query1 | psql -h $dbHost -p $port -U $user -d $database -c $query1
} else {
    Write-Host "psql bulunamadı. Docker container kullanılıyor..." -ForegroundColor Yellow
    
    # Docker exec ile
    docker exec -i commerce-db psql -U postgres -d commerce -c $query1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "commerce-db container bulunamadı, commerce-postgres deneniyor..." -ForegroundColor Yellow
        docker exec -i commerce-postgres psql -U postgres -d commerce -c $query1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "2. Sepetteki Item'ları Kontrol Et:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$query2 = @"
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
"@

if ($psqlPath) {
    $query2 | psql -h $dbHost -p $port -U $user -d $database -c $query2
} else {
    docker exec -i commerce-db psql -U postgres -d commerce -c $query2
    
    if ($LASTEXITCODE -ne 0) {
        docker exec -i commerce-postgres psql -U postgres -d commerce -c $query2
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "3. Migration V36 Kontrolü:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$query3 = @"
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'cart_items' 
AND column_name = 'product_variant_id';
"@

if ($psqlPath) {
    $query3 | psql -h $dbHost -p $port -U $user -d $database -c $query3
} else {
    docker exec -i commerce-db psql -U postgres -d commerce -c $query3
    
    if ($LASTEXITCODE -ne 0) {
        docker exec -i commerce-postgres psql -U postgres -d commerce -c $query3
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "4. Constraint Kontrolü:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$query4 = @"
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'cart_items'
AND constraint_type IN ('UNIQUE', 'FOREIGN KEY');
"@

if ($psqlPath) {
    $query4 | psql -h $dbHost -p $port -U $user -d $database -c $query4
} else {
    docker exec -i commerce-db psql -U postgres -d commerce -c $query4
    
    if ($LASTEXITCODE -ne 0) {
        docker exec -i commerce-postgres psql -U postgres -d commerce -c $query4
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Kontrol Tamamlandı!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

