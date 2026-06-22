-- V52'deki UPDATE WHERE IS NULL koşulu DEFAULT FALSE ile eklenen satırları yakalamadı.
-- Mevcut tüm kullanıcılar kayıt öncesi oluşturulduğundan doğrulanmış kabul edilir.
UPDATE users SET email_verified = TRUE WHERE email_verified = FALSE;
