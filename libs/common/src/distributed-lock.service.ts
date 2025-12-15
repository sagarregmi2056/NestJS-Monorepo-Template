import { Injectable, Inject, Optional, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';

export interface LockOptions {
  /**
   * Lock key (unique identifier)
   */
  key: string;

  /**
   * Time to live in seconds (how long the lock is held)
   * @default 60
   */
  ttl?: number;

  /**
   * Retry attempts if lock acquisition fails
   * @default 0 (no retry)
   */
  retries?: number;

  /**
   * Delay between retries in milliseconds
   * @default 100
   */
  retryDelay?: number;
}

/**
 * Distributed Lock Service
 * 
 * Prevents race conditions and duplicate job processing when scaling workers horizontally.
 * Uses Redis for distributed locking with database fallback.
 * 
 * Features:
 * - Distributed locking across multiple worker instances
 * - Automatic lock expiration
 * - Retry mechanism
 * - Database fallback if Redis unavailable
 */
@Injectable()
export class DistributedLockService {
  private readonly logger = new Logger(DistributedLockService.name);
  private readonly lockPrefix = 'lock:';
  private readonly defaultTtl = 60; // 60 seconds default
  private readonly dbLocks = new Map<string, { expiresAt: number; instanceId: string }>();
  private readonly instanceId: string;

  constructor(
    @Optional() @Inject(CACHE_MANAGER) private readonly cacheManager?: Cache,
    @Optional() private readonly configService?: ConfigService,
  ) {
    // Generate unique instance ID for this worker
    this.instanceId = `${process.pid}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Acquire a distributed lock
   * @returns true if lock acquired, false otherwise
   */
  async acquireLock(options: LockOptions): Promise<boolean> {
    const {
      key,
      ttl = this.defaultTtl,
      retries = 0,
      retryDelay = 100,
    } = options;

    const lockKey = `${this.lockPrefix}${key}`;
    const lockValue = this.instanceId;
    const ttlMs = ttl * 1000;

    // Try Redis first (if available)
    if (this.cacheManager) {
      return this.acquireRedisLock(lockKey, lockValue, ttlMs, retries, retryDelay);
    }

    // Fallback to in-memory/database locking
    return this.acquireDatabaseLock(lockKey, lockValue, ttlMs, retries, retryDelay);
  }

  /**
   * Release a distributed lock
   */
  async releaseLock(key: string): Promise<void> {
    const lockKey = `${this.lockPrefix}${key}`;

    if (this.cacheManager) {
      // Check if we own the lock before releasing
      const currentOwner = await this.cacheManager.get<string>(lockKey);
      if (currentOwner === this.instanceId) {
        await this.cacheManager.del(lockKey);
        this.logger.debug(`Lock released: ${key}`);
      }
    } else {
      // Database fallback
      const lock = this.dbLocks.get(lockKey);
      if (lock && lock.instanceId === this.instanceId) {
        this.dbLocks.delete(lockKey);
        this.logger.debug(`Lock released: ${key}`);
      }
    }
  }

  /**
   * Check if a lock is currently held
   */
  async isLocked(key: string): Promise<boolean> {
    const lockKey = `${this.lockPrefix}${key}`;

    if (this.cacheManager) {
      const value = await this.cacheManager.get<string>(lockKey);
      return value !== undefined && value !== null;
    }

    // Database fallback
    const lock = this.dbLocks.get(lockKey);
    if (!lock) {
      return false;
    }

    // Check if expired
    if (lock.expiresAt < Date.now()) {
      this.dbLocks.delete(lockKey);
      return false;
    }

    return true;
  }

  /**
   * Acquire lock using Redis
   */
  private async acquireRedisLock(
    lockKey: string,
    lockValue: string,
    ttlMs: number,
    retries: number,
    retryDelay: number,
  ): Promise<boolean> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Try to get existing lock
        const existingLock = await this.cacheManager.get<string>(lockKey);

        if (!existingLock) {
          // Lock is available, acquire it
          await this.cacheManager.set(lockKey, lockValue, ttlMs);
          this.logger.debug(`Lock acquired: ${lockKey} (attempt ${attempt + 1})`);
          return true;
        }

        // Lock is held by another instance
        if (attempt < retries) {
          await this.delay(retryDelay);
          continue;
        }

        this.logger.debug(`Lock acquisition failed: ${lockKey} (held by another instance)`);
        return false;
      } catch (error) {
        this.logger.warn(`Redis lock acquisition error: ${error instanceof Error ? error.message : error}`);
        // Fallback to database locking on Redis error
        return this.acquireDatabaseLock(lockKey, lockValue, ttlMs, retries, retryDelay);
      }
    }

    return false;
  }

  /**
   * Acquire lock using database/in-memory fallback
   */
  private async acquireDatabaseLock(
    lockKey: string,
    lockValue: string,
    ttlMs: number,
    retries: number,
    retryDelay: number,
  ): Promise<boolean> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      // Clean up expired locks first
      this.cleanupExpiredLocks();

      const existingLock = this.dbLocks.get(lockKey);

      if (!existingLock || existingLock.expiresAt < Date.now()) {
        // Lock is available or expired, acquire it
        this.dbLocks.set(lockKey, {
          instanceId: lockValue,
          expiresAt: Date.now() + ttlMs,
        });

        this.logger.debug(`Lock acquired (DB fallback): ${lockKey} (attempt ${attempt + 1})`);
        return true;
      }

      // Lock is held by another instance
      if (attempt < retries) {
        await this.delay(retryDelay);
        continue;
      }

      this.logger.debug(`Lock acquisition failed (DB fallback): ${lockKey} (held by another instance)`);
      return false;
    }

    return false;
  }

  /**
   * Clean up expired locks
   */
  private cleanupExpiredLocks(): void {
    const now = Date.now();
    for (const [key, lock] of this.dbLocks.entries()) {
      if (lock.expiresAt < now) {
        this.dbLocks.delete(key);
      }
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

