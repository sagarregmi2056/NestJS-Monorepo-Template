# Security Library

Production-ready security middleware for NestJS applications.

## 🛡️ Features

- **Helmet**: Security headers (CSP, X-Frame-Options, etc.)
- **Compression**: Response compression for better performance
- **Rate Limiting**: API abuse protection
- **Request Logging**: Comprehensive HTTP request/response logging

## 📦 Installation

Already included in the template. If adding to a new project:

```bash
npm install helmet compression express-rate-limit
npm install -D @types/compression
```

## 🚀 Usage

### Basic Usage

Simply import `SecurityModule` in your app module:

```typescript
import { Module } from '@nestjs/common';
import { SecurityModule } from '@app/security';

@Module({
  imports: [SecurityModule],
})
export class AppModule {}
```

**Note**: Helmet, Compression, and Logging are applied automatically. Rate limiting is **NOT applied globally** - apply it selectively to specific routes.

### Rate Limiting (Selective Application)

Rate limiting should be applied to specific routes, not globally:

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecurityModule, RateLimitMiddleware, strictRateLimit } from '@app/security';

@Module({
  imports: [SecurityModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply strict rate limiting to auth endpoints only
    consumer
      .apply(strictRateLimit)
      .forRoutes('auth/login', 'auth/register');
  }
}
```

See [RATE_LIMITING_GUIDE.md](./RATE_LIMITING_GUIDE.md) for complete guide.

### Custom Configuration

You can configure each middleware via environment variables:

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX=100             # 100 requests per window
TRUSTED_IPS=127.0.0.1,::1      # IPs to skip rate limiting

# Compression
COMPRESSION_LEVEL=6            # 1-9 (higher = better compression, slower)
COMPRESSION_THRESHOLD=1024     # Only compress if > 1KB

# Logging
LOG_LEVEL=info                 # debug, info, warn, error
```

### Individual Middleware

You can also use individual middleware:

```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { 
  HelmetMiddleware,
  CompressionMiddleware,
  LoggerMiddleware,
  RateLimitMiddleware 
} from '@app/security';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        HelmetMiddleware,
        CompressionMiddleware,
        LoggerMiddleware,
        RateLimitMiddleware,
      )
      .forRoutes('*');
  }
}
```

### Selective Application

Apply middleware to specific routes:

```typescript
consumer
  .apply(RateLimitMiddleware)
  .forRoutes('api/*'); // Only apply to /api/* routes
```

## 🔧 Middleware Details

### HelmetMiddleware

Sets security headers:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy

### CompressionMiddleware

Compresses response bodies:
- Automatic compression based on content type
- Configurable compression level
- Threshold for minimum response size

### LoggerMiddleware

Logs all HTTP requests:
- Request method, URL, IP
- Response status and duration
- User agent
- Color-coded by status (green/yellow/red)

### RateLimitMiddleware

Protects against API abuse:
- Configurable window and max requests
- Trusted IPs can bypass limits
- Returns proper error messages

## 📊 Production Recommendations

### Rate Limiting

For production, consider:
- **API endpoints**: 100 requests per 15 minutes
- **Auth endpoints**: 5 requests per 15 minutes
- **Public endpoints**: 1000 requests per 15 minutes

### Compression

- Use level 6 for balanced performance
- Only compress responses > 1KB
- Monitor CPU usage

### Logging

- Use structured logging in production
- Consider log aggregation (ELK, Datadog, etc.)
- Rotate logs regularly

## 🔒 Security Best Practices

1. **Always use Helmet** - Protects against common vulnerabilities
2. **Enable Rate Limiting** - Prevents abuse and DDoS
3. **Monitor Logs** - Detect suspicious activity
4. **Use Compression** - Reduces bandwidth and improves performance
5. **Configure Trusted IPs** - For internal services

## 📚 Related Documentation

- [NestJS Middleware](https://docs.nestjs.com/middleware)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)

