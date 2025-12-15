import { Injectable, OnModuleInit, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Logger } from '@nestjs/common';
import { CacheConfig } from '@app/configuration';

/**
 * Cache Initialization Service
 * 
 * Logs cache status after module initialization
 */
@Injectable()
export class CacheInitializationService implements OnModuleInit {
  private readonly logger = new Logger('CacheModule');

  constructor(
    private readonly configService: ConfigService,
    @Optional() @Inject(CACHE_MANAGER) private readonly cacheManager?: Cache,
  ) {}

  async onModuleInit() {
    const config: CacheConfig = this.configService.get('cache') || {
      enabled: false,
      host: 'localhost',
      port: 6379,
      ttl: 3600,
      keyPrefix: 'nestjs:',
    };

    if (config.enabled) {
      this.logger.log(`Redis cache initialized: ${config.host}:${config.port}`);
      this.logger.log(`   TTL: ${config.ttl}s | Prefix: ${config.keyPrefix}`);
      
      // Test cache connection
      try {
        const testKey = 'cache:init:test';
        await this.cacheManager?.set(testKey, 'test', 1);
        const value = await this.cacheManager?.get(testKey);
        await this.cacheManager?.del(testKey);
        
        if (value === 'test') {
          this.logger.log('   Cache connection test successful');
        } else {
          this.logger.warn('   Cache connection test failed - using fallback');
        }
      } catch (error) {
        this.logger.warn(`   Cache connection test error: ${error instanceof Error ? error.message : error}`);
      }
    } else {
      this.logger.log('In-memory cache initialized');
      this.logger.log(`   TTL: ${config.ttl}s | Max items: ${config.max || 100}`);
    }
  }
}

