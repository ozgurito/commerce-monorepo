-- V51: Eski presigned-URL akışıyla kaydedilen görselleri düzelt
-- Sorun: uploads/abc123.jpg gibi relative key'ler saklanıyordu (tam URL yerine)
-- Çözüm: http://localhost:9000/commerce-assets/ prefix'i ekle
-- Yeni upload akışı (multipart POST /api/assets/upload) tam URL döndürür → bu migration'a gerek kalmaz

UPDATE product_images
SET
    image_url  = 'http://localhost:9000/commerce-assets/' || image_url,
    updated_at = CURRENT_TIMESTAMP
WHERE image_url IS NOT NULL
  AND image_url NOT LIKE 'http%'
  AND image_url NOT LIKE '/images/%';
