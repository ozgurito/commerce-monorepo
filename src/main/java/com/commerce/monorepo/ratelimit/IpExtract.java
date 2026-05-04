package com.commerce.monorepo.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * İstemci IP adresini güvenli biçimde çıkarır.
 *
 * X-Forwarded-For yalnızca güvenilen ağdan gelen isteklerde (TRUSTED_PROXY_ENABLED=true)
 * dikkate alınır; aksi hâlde her zaman TCP katmanındaki gerçek IP kullanılır.
 * Bu sayede saldırganın "X-Forwarded-For: 1.2.3.4" başlığı göndererek
 * rate-limit'i atlaması engellenir.
 */
@Component
public class IpExtract {

    /** Prod'da nginx/load-balancer arkasındaysan true yap (ENV: TRUSTED_PROXY=true) */
    @Value("${app.trusted-proxy-enabled:false}")
    private boolean trustedProxyEnabled;

    public String getClientIp(HttpServletRequest request) {
        if (trustedProxyEnabled) {
            String xf = request.getHeader("X-Forwarded-For");
            if (xf != null && !xf.isBlank()) {
                // İlk IP her zaman orijinal istemcidir (sol-most)
                String ip = xf.split(",")[0].trim();
                if (!ip.isEmpty()) return ip;
            }
        }
        return request.getRemoteAddr();
    }
}
