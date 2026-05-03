-- V46: Admin kullanıcı e-postasını geçerli bir formata güncelle
UPDATE users
SET email = 'admin@admin.com',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@local';
