@echo off
REM 📧 EMAIL TEST SETUP SCRIPT - Windows CMD
REM Bu script, email testi için environment variables'ları ayarlar

echo ========================================
echo   EMAIL TEST SETUP
echo ========================================
echo.

REM Gmail bilgilerini al
set /p EMAIL="Gmail adresiniz (örn: test@gmail.com): "
set /p APP_PASSWORD="App Password (16 haneli): "
set /p FRONTEND_URL="Frontend URL (varsayılan: http://localhost:3000): "
set /p FROM_NAME="Gönderen adı (varsayılan: Your Store): "

REM Varsayılan değerler
if "%FRONTEND_URL%"=="" set FRONTEND_URL=http://localhost:3000
if "%FROM_NAME%"=="" set FROM_NAME=Your Store

REM Environment variables'ları ayarla
set MAIL_HOST=smtp.gmail.com
set MAIL_PORT=587
set MAIL_USERNAME=%EMAIL%
set MAIL_PASSWORD=%APP_PASSWORD%
set APP_EMAIL_FROM=%EMAIL%
set APP_EMAIL_FROM_NAME=%FROM_NAME%
set FRONTEND_URL=%FRONTEND_URL%

echo.
echo ✅ Environment variables başarıyla ayarlandı!
echo.
echo Ayarlar:
echo   MAIL_HOST: %MAIL_HOST%
echo   MAIL_PORT: %MAIL_PORT%
echo   MAIL_USERNAME: %MAIL_USERNAME%
echo   MAIL_PASSWORD: ******** (gizli)
echo   APP_EMAIL_FROM: %APP_EMAIL_FROM%
echo   APP_EMAIL_FROM_NAME: %APP_EMAIL_FROM_NAME%
echo   FRONTEND_URL: %FRONTEND_URL%
echo.

echo ========================================
echo   SONRAKI ADIMLAR
echo ========================================
echo.
echo 1. Uygulamayı başlatın:
echo    mvn spring-boot:run
echo.
echo 2. Swagger UI'ya gidin:
echo    http://localhost:8080/swagger-ui.html
echo.
echo 3. Test endpoint'lerini çalıştırın
echo.
echo NOT: Bu environment variables sadece bu CMD penceresi için geçerlidir.
echo      Yeni bir terminal açarsanız tekrar çalıştırmanız gerekir.
echo.

pause

