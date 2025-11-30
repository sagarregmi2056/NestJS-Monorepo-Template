# Security Middleware Guide

Complete guide to the production-ready security middleware included in this template.

## 🎯 Overview

The `libs/security` library provides enterprise-grade security middleware that senior developers can use directly in production. No configuration needed - it works out of the box!

## 📦 What's Included

### 1. **Helmet** - Security Headers
Protects against common web vulnerabilities by setting HTTP headers:
- Content Security Policy (CSP)
- X-Frame-Options (prevents clickjacking)
- X-Content-Type-Options (prevents MIME sniffing)
- Referrer-Policy
- Permissions-Policy

### 2. **Compression** - Response Compression
Reduces bandwidth usage and improves performance:
- Automatic compression based on content type
- Configurable compression level (1-9)
- Threshold for minimum response size

### 3. **Rate Limiting** - API Protection
Prevents API abuse and DDoS attacks:
- Configurable request limits per IP
- Time window-based limiting
- Trusted IP bypass

### 4. **Request Logging** - Observability
Comprehensive HTTP request/response logging:
- Request method, URL, IP address
- Response status and duration
- User agent
- Color-coded by status code

## 🚀 Quick Start

### Step 1: Import SecurityModule

```typescript
// apps/api-server/src/app.module.ts
import { SecurityModule } from '@app/security';

@Module({
  imports: [SecurityModule], // That's it!
})
export class AppModule {}
```

**Note**: Rate limiting is **NOT applied globally** by default. Apply it selectively to specific routes. See [RATE_LIMITING_GUIDE.md](./libs/security/RATE_LIMITING_GUIDE.md) for details.

### Step 2: Configure (Optional)

Add to your `.env` file:

```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX=100             # 100 requests per window
TRUSTED_IPS=127.0.0.1,::1      # Skip rate limiting for these IPs

# Compression
COMPRESSION_LEVEL=6            # 1-9 (6 is optimal)
COMPRESSION_THRESHOLD=1024     # Only compress if > 1KB
```

### Step 3: Done!

All security middleware is now active on all routes.

## 📋 Default Configuration

| Middleware | Default | Description |
|------------|---------|--------------|
| Rate Limit | 100 req/15min | Per IP address |
| Compression | Level 6 | Balanced performance |
| Compression Threshold | 1KB | Only compress larger responses |
| Logging | All requests | With status codes |

## 🔧 Advanced Usage

### Custom Rate Limits per Route

```typescript
import { RateLimitMiddleware } from '@app/security';

// Create custom rate limiter
const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
});

// Apply to specific routes
consumer
  .apply(strictRateLimit)
  .forRoutes('auth/login', 'auth/register');
```

### Disable Compression for Specific Routes

```typescript
// Add header in your controller
@Get('large-file')
getLargeFile(@Res() res: Response) {
  res.setHeader('x-no-compression', '1');
  // ... return large file
}
```

### Custom Logging

```typescript
import { LoggerMiddleware } from '@app/security';

// The middleware automatically logs:
// - Request: method, URL, IP, user agent
// - Response: status, duration, content length
// - Errors: with stack traces
```

## 🎯 Production Recommendations

### Rate Limiting Strategy

```env
# Public API
RATE_LIMIT_MAX=1000           # Higher limit for public endpoints

# Authenticated API
RATE_LIMIT_MAX=100            # Standard limit

# Auth endpoints
RATE_LIMIT_MAX=5              # Strict limit for login/register
```

### Compression Settings

```env
# High traffic API
COMPRESSION_LEVEL=4           # Faster, less CPU

# Low traffic API
COMPRESSION_LEVEL=9           # Better compression, more CPU
```

### Logging

- Use structured logging in production
- Integrate with log aggregation services
- Set up alerts for error rates
- Monitor response times

## 🔒 Security Best Practices

1. **Always Enable Helmet** ✅
   - Protects against XSS, clickjacking, MIME sniffing
   - No performance impact

2. **Use Rate Limiting** ✅
   - Prevents brute force attacks
   - Protects against DDoS
   - Configurable per endpoint

3. **Enable Compression** ✅
   - Reduces bandwidth costs
   - Improves user experience
   - Minimal CPU overhead

4. **Monitor Logs** ✅
   - Detect suspicious activity
   - Track error rates
   - Monitor performance

## 📊 Performance Impact

| Middleware | CPU Impact | Memory Impact | Network Impact |
|------------|------------|---------------|----------------|
| Helmet | Negligible | None | None |
| Compression | Low (5-10%) | Low | High savings |
| Rate Limiting | Negligible | Low | None |
| Logging | Negligible | Low | None |

**Total Impact**: < 10% CPU overhead, significant bandwidth savings

## 🐛 Troubleshooting

### Rate Limit Too Strict

```env
# Increase limit
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour
```

### Compression Not Working

1. Check response size > threshold
2. Verify client supports compression
3. Check `x-no-compression` header

### Logs Too Verbose

The logger automatically filters by status:
- **Green**: 2xx (success)
- **Yellow**: 4xx (client errors)
- **Red**: 5xx (server errors)

## 📚 API Reference

See [libs/security/README.md](./libs/security/README.md) for detailed API documentation.

## 🎓 Example: Complete Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { SecurityModule } from '@app/security';

@Module({
  imports: [SecurityModule],
})
export class AppModule {}
```

```env
# .env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
COMPRESSION_LEVEL=6
COMPRESSION_THRESHOLD=1024
```

That's it! Your app is now production-ready with enterprise security middleware! 🚀

