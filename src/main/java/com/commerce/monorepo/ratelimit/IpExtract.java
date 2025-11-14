package com.commerce.monorepo.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class IpExtract {

    public String getClientIp(HttpServletRequest request) {
        String xf=request.getHeader("X-Forwarded-For");
        if(xf!=null){
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
