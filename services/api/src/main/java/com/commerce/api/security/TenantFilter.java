package com.commerce.api.security;

import jakarta.persistence.EntityManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.hibernate.Session;
import org.hibernate.engine.spi.SessionImplementor;
import org.hibernate.Filter;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class TenantFilter extends OncePerRequestFilter {

    private final EntityManager entityManager;

    public TenantFilter(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req,
                                    HttpServletResponse res,
                                    FilterChain fc) throws ServletException, IOException {
        try {
            String host = req.getHeader("Host");
            String sub = (host != null && host.contains(".")) ? host.split("\\.")[0] : "public";
            TenantContext.set(sub);

            // TenantFilter devre dışı - Hibernate filter kullanılmıyor
            // Session session = entityManager.unwrap(Session.class);
            // Filter f = session.getEnabledFilter("tenantFilter");
            // if (f == null) {
            //     session.enableFilter("tenantFilter").setParameter("tenantId", TenantContext.get());
            // } else {
            //     f.setParameter("tenantId", TenantContext.get());
            // }

            fc.doFilter(req, res);
        } finally {
            TenantContext.clear();
        }
    }
}