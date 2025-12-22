#!/bin/bash
# 📧 EMAIL TEST SETUP SCRIPT - Linux/Mac
# Bu script, email testi için environment variables'ları ayarlar

echo "========================================"
echo "  EMAIL TEST SETUP"
echo "========================================"
echo ""

# Gmail bilgilerini al
echo "Gmail bilgilerinizi girin:"
echo ""

read -p "Gmail adresiniz (örn: test@gmail.com): " EMAIL
read -sp "App Password (16 haneli, boşluklu veya boşluksuz): " APP_PASSWORD
echo ""
read -p "Frontend URL (varsayılan: http://localhost:3000): " FRONTEND_URL
read -p "Email gönderen adı (varsayılan: Your Store): " FROM_NAME

# Varsayılan değerler
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
FROM_NAME=${FROM_NAME:-Your Store}

# Environment variables'ları ayarla
export MAIL_HOST=smtp.gmail.com
export MAIL_PORT=587
export MAIL_USERNAME=$EMAIL
export MAIL_PASSWORD=$APP_PASSWORD
export APP_EMAIL_FROM=$EMAIL
export APP_EMAIL_FROM_NAME=$FROM_NAME
export FRONTEND_URL=$FRONTEND_URL

echo ""
echo "✅ Environment variables başarıyla ayarlandı!"
echo ""
echo "Ayarlar:"
echo "  MAIL_HOST: $MAIL_HOST"
echo "  MAIL_PORT: $MAIL_PORT"
echo "  MAIL_USERNAME: $MAIL_USERNAME"
echo "  MAIL_PASSWORD: ******** (gizli)"
echo "  APP_EMAIL_FROM: $APP_EMAIL_FROM"
echo "  APP_EMAIL_FROM_NAME: $APP_EMAIL_FROM_NAME"
echo "  FRONTEND_URL: $FRONTEND_URL"
echo ""

echo "========================================"
echo "  SONRAKI ADIMLAR"
echo "========================================"
echo ""
echo "1. Uygulamayı başlatın:"
echo "   mvn spring-boot:run"
echo ""
echo "2. Swagger UI'ya gidin:"
echo "   http://localhost:8080/swagger-ui.html"
echo ""
echo "3. Test endpoint'lerini çalıştırın:"
echo "   - POST /api/auth/register"
echo "   - POST /api/auth/forgot-password"
echo ""
echo "4. Gmail'inizi kontrol edin!"
echo ""
echo "NOT: Bu environment variables sadece bu terminal oturumu için geçerlidir."
echo "     Yeni bir terminal açarsanız tekrar çalıştırmanız gerekir."
echo ""

# Test etmek ister misiniz?
read -p "Şimdi uygulamayı başlatmak ister misiniz? (y/n): " TEST
if [ "$TEST" = "y" ] || [ "$TEST" = "Y" ]; then
    echo ""
    echo "Uygulama başlatılıyor..."
    echo ""
    mvn spring-boot:run
fi

