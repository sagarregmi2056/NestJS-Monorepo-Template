# Rate Limiting Guide

Complete guide to applying rate limiting to specific APIs and routes.

## 🎯 Overview

Rate limiting is **NOT applied globally by default**. You can apply it selectively to specific routes that need protection.

## 🚀 Quick Start

### Option 1: Apply to Specific Routes (Recommended)

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityModule, RateLimitMiddleware } from '@app/security';

@Module({
  imports: [SecurityModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply rate limiting only to auth routes
    consumer
      .apply(RateLimitMiddleware)
      .forRoutes('auth/login', 'auth/register', 'auth/reset-password');
  }
}
```

### Option 2: Use Pre-configured Rate Limiters

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityModule } from '@app/security';
import { strictRateLimit, normalRateLimit, lenientRateLimit } from '@app/security';

@Module({
  imports: [SecurityModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Strict rate limit for auth endpoints (5 requests per 15 min)
    consumer
      .apply(strictRateLimit)
      .forRoutes('auth/*');

    // Normal rate limit for API endpoints (100 requests per 15 min)
    consumer
      .apply(normalRateLimit)
      .forRoutes('api/*');

    // Lenient rate limit for public endpoints (1000 requests per 15 min)
    consumer
      .apply(lenientRateLimit)
      .forRoutes('public/*');
  }
}
```

## 📋 Pre-configured Rate Limiters

### 1. Strict Rate Limiter

**Use for**: Auth endpoints (login, register, password reset)

```typescript
import { strictRateLimit } from '@app/security';

// 5 requests per 15 minutes
consumer
  .apply(strictRateLimit)
  .forRoutes('auth/login', 'auth/register');
```

**Configuration:**
```env
RATE_LIMIT_STRICT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_STRICT_MAX=5             # 5 requests
```

### 2. Normal Rate Limiter

**Use for**: Standard API endpoints

```typescript
import { normalRateLimit } from '@app/security';

// 100 requests per 15 minutes
consumer
  .apply(normalRateLimit)
  .forRoutes('api/*');
```

**Configuration:**
```env
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # 100 requests
```

### 3. Lenient Rate Limiter

**Use for**: Public endpoints that can handle more traffic

```typescript
import { lenientRateLimit } from '@app/security';

// 1000 requests per 15 minutes
consumer
  .apply(lenientRateLimit)
  .forRoutes('public/*', 'health');
```

**Configuration:**
```env
RATE_LIMIT_LENIENT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_LENIENT_MAX=1000          # 1000 requests
```

## 🔧 Custom Rate Limiter

Create your own rate limiter:

```typescript
import { createRateLimit } from '@app/security';

// Custom: 10 requests per minute
const customLimiter = createRateLimit(
  60 * 1000,  // 1 minute
  10,         // 10 requests
  'Too many requests, please slow down.',
);

consumer
  .apply(customLimiter)
  .forRoutes('api/expensive-operation');
```

## 📝 Real-World Examples

### Example 1: Auth Endpoints Only

```typescript
@Module({
  imports: [SecurityModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Only protect auth endpoints
    consumer
      .apply(strictRateLimit)
      .forRoutes(
        'auth/login',
        'auth/register',
        'auth/forgot-password',
        'auth/reset-password',
      );
  }
}
```

### Example 2: Different Limits for Different Routes

```typescript
@Module({
  imports: [SecurityModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Strict for auth
    consumer
      .apply(strictRateLimit)
      .forRoutes('auth/*');

    // Normal for API
    consumer
      .apply(normalRateLimit)
      .forRoutes('api/*');

    // Lenient for public
    consumer
      .apply(lenientRateLimit)
      .forRoutes('public/*', 'health');
  }
}
```

### Example 3: Controller-Based Application

```typescript
import { Controller, UseGuards } from '@nestjs/common';
import { strictRateLimit } from '@app/security';

@Controller('auth')
export class AuthController {
  // Apply rate limiting to entire controller
  @UseGuards(strictRateLimit)
  @Post('login')
  login() {
    // ...
  }
}
```

### Example 4: Multiple Rate Limits

```typescript
consumer
  .apply(strictRateLimit)
  .forRoutes('auth/login', 'auth/register');

consumer
  .apply(normalRateLimit)
  .forRoutes('api/users', 'api/products');

consumer
  .apply(lenientRateLimit)
  .forRoutes('public/*');
```

## 🎯 Best Practices

### 1. **Protect Sensitive Endpoints**

Always protect:
- Login/Register endpoints
- Password reset
- Email verification
- Payment endpoints

### 2. **Use Appropriate Limits**

| Endpoint Type | Rate Limit | Example |
|--------------|------------|---------|
| Auth | Strict (5/15min) | Login, Register |
| API | Normal (100/15min) | CRUD operations |
| Public | Lenient (1000/15min) | Health checks, public data |

### 3. **Don't Over-Limit**

- Don't apply rate limiting to health checks
- Don't apply to internal service endpoints
- Use trusted IPs for internal services

### 4. **Monitor and Adjust**

- Monitor rate limit hits
- Adjust limits based on usage
- Consider user tiers (free vs premium)

## 🔒 Trusted IPs

Skip rate limiting for internal services:

```env
TRUSTED_IPS=127.0.0.1,::1,10.0.0.0/8
```

## 📊 Configuration Reference

### Environment Variables

```env
# Strict Rate Limit (Auth endpoints)
RATE_LIMIT_STRICT_WINDOW_MS=900000   # 15 minutes
RATE_LIMIT_STRICT_MAX=5              # 5 requests

# Normal Rate Limit (API endpoints)
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes
RATE_LIMIT_MAX=100                   # 100 requests

# Lenient Rate Limit (Public endpoints)
RATE_LIMIT_LENIENT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_LENIENT_MAX=1000          # 1000 requests

# Trusted IPs (skip rate limiting)
TRUSTED_IPS=127.0.0.1,::1
```

## 🐛 Troubleshooting

### Rate Limit Not Applied

1. Check middleware is applied in `configure()` method
2. Verify route paths match exactly
3. Check if route is excluded by `skip()` function

### Too Strict

Increase limits in `.env`:
```env
RATE_LIMIT_MAX=200  # Increase from 100 to 200
```

### Too Lenient

Decrease limits:
```env
RATE_LIMIT_MAX=50  # Decrease from 100 to 50
```

## 📚 Related

- [Security Middleware Guide](./../SECURITY_MIDDLEWARE.md) - Complete security guide
- [libs/security/README.md](./README.md) - Security library documentation

