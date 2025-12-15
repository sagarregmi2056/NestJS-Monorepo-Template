import { Module, DynamicModule, Global, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
import { CacheInterceptor } from './cache.interceptor';
import { CacheInitializationService } from './cache-initialization.service';
import { CacheConfig } from '@app/configuration';

/**
 * Cache Module
 * 
 * Provides Redis caching with in-memory fallback.
 * Cache is optional - if Redis is disabled, falls back to in-memory cache.
 * 
 * Usage:
 * ```typescript
 * @Module({
 *   imports: [CacheModule.forRoot()],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class CacheModule {
  private static readonly logger = new Logger('CacheModule');

  static forRoot(): DynamicModule {
    return {
      module: CacheModule,
      imports: [
        ConfigModule,
        NestCacheModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const config: CacheConfig = configService.get('cache') || {
              enabled: false,
              host: 'localhost',
              port: 6379,
              ttl: 3600,
              keyPrefix: 'nestjs:',
            };

            // Log cache configuration
            if (config.enabled) {
              CacheModule.logger.log(`Redis cache enabled: ${config.host}:${config.port}`);
              CacheModule.logger.log(`   TTL: ${config.ttl}s | Prefix: ${config.keyPrefix}`);
            } else {
              CacheModule.logger.log('In-memory cache enabled (Redis disabled)');
              CacheModule.logger.log(`   TTL: ${config.ttl}s | Max items: ${config.max || 100}`);
            }

            // If Redis is enabled, use Redis store
            if (config.enabled) {
              try {
                const redisConfig: any = {
                  host: config.host,
                  port: config.port,
                  db: config.db || 0,
                };

                // Only add password if provided
                if (config.password) {
                  redisConfig.password = config.password;
                }

                CacheModule.logger.log(`Connecting to Redis at ${config.host}:${config.port}...`);

                return {
                  store: redisStore,
                  ...redisConfig,
                  ttl: config.ttl, // cache-manager-redis-store uses seconds
                };
              } catch (error) {
                CacheModule.logger.warn(`Failed to connect to Redis, falling back to in-memory cache: ${error instanceof Error ? error.message : error}`);
                // Fall back to in-memory cache
                return {
                  ttl: config.ttl * 1000,
                  max: config.max || 100,
                };
              }
            }

            // Use in-memory cache
            CacheModule.logger.log('Using in-memory cache');
            return {
              ttl: config.ttl * 1000, // Convert to milliseconds
              max: config.max || 100,
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [CacheService, CacheInterceptor, CacheInitializationService],
      exports: [CacheService, CacheInterceptor, NestCacheModule],
    };
  }
}

