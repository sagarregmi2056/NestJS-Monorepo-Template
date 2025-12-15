import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DbModule } from '@app/db';
import { SecurityModule, normalRateLimit } from '@app/security';
import { CacheModule, CacheInterceptor } from '@app/cache';
import { databaseConfig, appConfig, jwtConfig, cacheConfig, getJoiValidationSchema } from '@app/configuration';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Configuration with Joi validation (fail-fast)
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig, jwtConfig, cacheConfig],
      envFilePath: ['.env.local', '.env'],
      validationSchema: getJoiValidationSchema(),
      validationOptions: {
        abortEarly: false, // Show all validation errors
        allowUnknown: true, // Allow unknown env vars
        stripUnknown: false, // Keep unknown vars
      },
    }),

    // Database (automatically selects based on DB_TYPE)
    DbModule.forRoot(),

    // Cache (Redis with in-memory fallback)
    CacheModule.forRoot(),

    // Security middleware (helmet, compression, logging applied automatically)
    SecurityModule,

    // Feature modules
    HealthModule,
    UsersModule.forRoot(),
    AuthModule,
  ],
  providers: [
    // Apply cache interceptor globally
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply rate limiting selectively to specific routes
    
    // Strict rate limit for auth endpoints (if you add auth later)
    // consumer
    //   .apply(strictRateLimit)
    //   .forRoutes('auth/login', 'auth/register', 'auth/reset-password');

    // Normal rate limit for API endpoints
    consumer
      .apply(normalRateLimit)
      .forRoutes('api/*');

    // No rate limiting for health checks
    // Health endpoint is excluded automatically
  }
}

