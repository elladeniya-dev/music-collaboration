package com.harmonix.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

public final class JwtUtil {
    
    private static String secretKey;
    private static Long expirationTime;

    private JwtUtil() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    public static void initialize(String secret, Long expiration) {
        secretKey = secret;
        expirationTime = expiration;
    }

    private static SecretKey getSigningKey() {
        if (secretKey == null || secretKey.isEmpty()) {
            throw new IllegalStateException("JWT secret key not initialized");
        }
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public static String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public static String validateToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject(); // returns email
    }
    
    public static String validateAndGetEmail(String token) {
        try {
            return validateToken(token);
        } catch (JwtException | IllegalArgumentException e) {
            return null; // invalid or expired token
        }
    }
}
