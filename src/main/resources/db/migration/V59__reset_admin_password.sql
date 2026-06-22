-- Admin şifresi "admin123" olarak sıfırlandı (BCrypt cost=10)
UPDATE users SET password = '$2a$10$5SvbsPSTdbz1s7ndtYRfdeYl3eyu6gb9CsAvgWk60D2n1LhGWJSwK'
WHERE role = 'ADMIN';
