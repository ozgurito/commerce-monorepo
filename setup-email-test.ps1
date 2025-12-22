# 📧 EMAIL TEST SETUP SCRIPT - Windows PowerShell
# Bu script, email testi için environment variables'ları ayarlar

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  EMAIL TEST SETUP" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Gmail bilgilerini al
Write-Host "Gmail bilgilerinizi girin:" -ForegroundColor Yellow
Write-Host ""

$email = Read-Host "Gmail adresiniz (örn: test@gmail.com)"
$appPassword = Read-Host "App Password (16 haneli, boşluklu veya boşluksuz)" -AsSecureString
$appPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($appPassword))

Write-Host ""
Write-Host "Frontend URL (varsayılan: http://localhost:3000):" -ForegroundColor Yellow
$frontendUrl = Read-Host "Frontend URL"
if ([string]::IsNullOrWhiteSpace($frontendUrl)) {
    $frontendUrl = "http://localhost:3000"
}

Write-Host ""
Write-Host "Email gönderen adı (varsayılan: Your Store):" -ForegroundColor Yellow
$fromName = Read-Host "Gönderen adı"
if ([string]::IsNullOrWhiteSpace($fromName)) {
    $fromName = "Your Store"
}

# Environment variables'ları ayarla
Write-Host ""
Write-Host "Environment variables ayarlanıyor..." -ForegroundColor Green

$env:MAIL_HOST = "smtp.gmail.com"
$env:MAIL_PORT = "587"
$env:MAIL_USERNAME = $email
$env:MAIL_PASSWORD = $appPasswordPlain
$env:APP_EMAIL_FROM = $email
$env:APP_EMAIL_FROM_NAME = $fromName
$env:FRONTEND_URL = $frontendUrl

Write-Host ""
Write-Host "✅ Environment variables başarıyla ayarlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "Ayarlar:" -ForegroundColor Cyan
Write-Host "  MAIL_HOST: $env:MAIL_HOST"
Write-Host "  MAIL_PORT: $env:MAIL_PORT"
Write-Host "  MAIL_USERNAME: $env:MAIL_USERNAME"
Write-Host "  MAIL_PASSWORD: ******** (gizli)"
Write-Host "  APP_EMAIL_FROM: $env:APP_EMAIL_FROM"
Write-Host "  APP_EMAIL_FROM_NAME: $env:APP_EMAIL_FROM_NAME"
Write-Host "  FRONTEND_URL: $env:FRONTEND_URL"
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SONRAKI ADIMLAR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Uygulamayı başlatın:" -ForegroundColor Yellow
Write-Host "   mvn spring-boot:run" -ForegroundColor White
Write-Host ""
Write-Host "2. Swagger UI'ya gidin:" -ForegroundColor Yellow
Write-Host "   http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host ""
Write-Host "3. Test endpoint'lerini çalıştırın:" -ForegroundColor Yellow
Write-Host "   - POST /api/auth/register" -ForegroundColor White
Write-Host "   - POST /api/auth/forgot-password" -ForegroundColor White
Write-Host ""
Write-Host "4. Gmail'inizi kontrol edin!" -ForegroundColor Yellow
Write-Host ""
Write-Host "NOT: Bu environment variables sadece bu PowerShell oturumu için geçerlidir." -ForegroundColor Gray
Write-Host "     Yeni bir terminal açarsanız tekrar çalıştırmanız gerekir." -ForegroundColor Gray
Write-Host ""

# Test etmek ister misiniz?
$test = Read-Host "Şimdi uygulamayı başlatmak ister misiniz? (y/n)"
if ($test -eq "y" -or $test -eq "Y") {
    Write-Host ""
    Write-Host "Uygulama başlatılıyor..." -ForegroundColor Green
    Write-Host ""
    mvn spring-boot:run
}

