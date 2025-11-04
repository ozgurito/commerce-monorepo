package com.commerce.api.security;

import java.util.Optional;

public final class TenantContext {
    private TenantContext() {}
    private static final ThreadLocal<String> CURRENT = new ThreadLocal<>();

    public static void set(String t){ CURRENT.set(t); }
    public static String get(){ return Optional.ofNullable(CURRENT.get()).orElse("public"); }
    public static void clear(){ CURRENT.remove(); }
}
