# Distributed Locking Guide

This guide explains how to prevent race conditions and duplicate job processing when scaling workers horizontally.

## Overview

When running multiple worker instances, scheduled tasks (cron jobs) will execute on **all instances simultaneously**, causing:
- **Race conditions** - Multiple instances processing the same data
- **Duplicate processing** - Same job running multiple times
- **Resource conflicts** - Database conflicts, API rate limits, etc.

The distributed locking mechanism ensures only **one worker instance** executes a job at a time.

## How It Works

1. **Lock Acquisition**: Before executing a cron job, the worker tries to acquire a distributed lock
2. **Lock Check**: If another instance already holds the lock, the current instance skips execution
3. **Lock Release**: After completion (or expiration), the lock is released
4. **Fallback**: Uses Redis if available, falls back to in-memory/database locking

## Usage

### Basic Usage

Add the `@DistributedLock()` decorator to your cron jobs:

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';
import { DistributedLock } from '@app/common';

@Injectable()
export class TasksService {
  @Cron(CronExpression.EVERY_HOUR)
  @DistributedLock({ key: 'hourly-task', ttl: 300 })
  async handleHourlyTask() {
    // This will only run on one worker instance
    console.log('Processing hourly task...');
  }
}
```

### Lock Options

```typescript
interface LockOptions {
  /**
   * Lock key (unique identifier)
   * Required - must be unique per job
   */
  key: string;

  /**
   * Time to live in seconds
   * How long the lock is held (should be longer than job execution time)
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
```

### Examples

#### Short-Running Task (5 minutes)

```typescript
@Cron(CronExpression.EVERY_HOUR)
@DistributedLock({ 
  key: 'sync-data', 
  ttl: 300  // 5 minutes
})
async syncData() {
  // Sync completes in ~2 minutes
  await this.dataService.sync();
}
```

#### Long-Running Task (1 hour)

```typescript
@Cron('0 2 * * *') // Daily at 2 AM
@DistributedLock({ 
  key: 'daily-cleanup', 
  ttl: 3600  // 1 hour
})
async dailyCleanup() {
  // Cleanup takes ~30 minutes
  await this.cleanupService.run();
}
```

#### Task with Retry

```typescript
@Cron(CronExpression.EVERY_30_SECONDS)
@DistributedLock({ 
  key: 'health-check',
  ttl: 30,
  retries: 3,      // Retry 3 times
  retryDelay: 500  // Wait 500ms between retries
})
async healthCheck() {
  await this.healthService.check();
}
```

## Configuration

### Redis (Recommended)

For production with multiple worker instances, use Redis:

```env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
```

Redis provides true distributed locking across multiple servers.

### Database Fallback

If Redis is not available, the system automatically falls back to in-memory locking (per instance). This works for single-instance deployments but **does not prevent duplicates across different servers**.

## Best Practices

### 1. Choose Appropriate TTL

Set TTL longer than expected execution time:

```typescript
// Good: TTL covers execution time + buffer
@DistributedLock({ key: 'task', ttl: 600 })  // 10 minutes
async longTask() {
  // Takes ~5 minutes
}

// Bad: TTL too short
@DistributedLock({ key: 'task', ttl: 60 })  // 1 minute
async longTask() {
  // Takes ~5 minutes - lock expires before completion!
}
```

### 2. Use Descriptive Lock Keys

```typescript
// Good: Descriptive and unique
@DistributedLock({ key: 'daily-user-cleanup', ttl: 3600 })
@DistributedLock({ key: 'hourly-report-generation', ttl: 300 })

// Bad: Generic or duplicate
@DistributedLock({ key: 'task', ttl: 60 })
@DistributedLock({ key: 'task', ttl: 60 })  // Duplicate key!
```

### 3. Don't Lock Short Tasks

For very short tasks (< 1 second), locking overhead may not be worth it:

```typescript
// Optional: Very fast task
@Cron(CronExpression.EVERY_30_SECONDS)
// No lock needed - runs fast, low risk
async quickHealthCheck() {
  this.logger.debug('Health check OK');
}
```

### 4. Handle Lock Failures Gracefully

The interceptor automatically skips execution if lock acquisition fails. Your code doesn't need special handling:

```typescript
@DistributedLock({ key: 'task', ttl: 300 })
async myTask() {
  // This code only runs if lock is acquired
  // If another instance has the lock, this method won't execute
  await this.processData();
}
```

## How It Prevents Duplicates

### Without Locking

```
Worker Instance 1: [Cron fires] → Executes task
Worker Instance 2: [Cron fires] → Executes task (DUPLICATE!)
Worker Instance 3: [Cron fires] → Executes task (DUPLICATE!)
```

### With Locking

```
Worker Instance 1: [Cron fires] → Acquires lock → Executes task
Worker Instance 2: [Cron fires] → Lock check → Lock held → SKIP
Worker Instance 3: [Cron fires] → Lock check → Lock held → SKIP
```

## Monitoring

Check logs to see lock acquisition:

```
[DistributedLock] Lock acquired: hourly-task (attempt 1)
[DistributedLock] Skipping execution - lock held by another instance: daily-cleanup
```

## Troubleshooting

### Lock Not Working Across Servers

**Problem**: Multiple servers still execute jobs simultaneously.

**Solution**: Ensure Redis is enabled and accessible:
```env
REDIS_ENABLED=true
REDIS_HOST=your-redis-host
```

### Lock Expiring Too Early

**Problem**: Job is interrupted because lock expires.

**Solution**: Increase TTL to cover execution time:
```typescript
@DistributedLock({ key: 'task', ttl: 1800 })  // 30 minutes instead of 5
```

### Lock Never Released

**Problem**: Lock persists after job completion.

**Solution**: Locks auto-expire based on TTL. If job crashes, lock will expire naturally. Consider reducing TTL if jobs complete quickly.

## Architecture

```
┌─────────────────┐
│  Worker App 1   │
│  ┌───────────┐  │
│  │ Cron Job  │  │
│  └─────┬─────┘  │
│        │        │
│        ▼        │
│  @DistributedLock│
│        │        │
└────────┼────────┘
         │
         ▼
    ┌─────────┐
    │  Redis  │  ← Lock Storage
    │  Lock   │
    └─────────┘
         │
         │
┌────────┼────────┐
│  Worker App 2   │
│  ┌───────────┐  │
│  │ Cron Job  │  │
│  └─────┬─────┘  │
│        │        │
│        ▼        │
│  @DistributedLock│
│        │        │
│        ▼        │
│   Lock Check    │
│   (SKIP)        │
└─────────────────┘
```

## Related Documentation

- [Worker Examples](./WORKER_EXAMPLES.md)
- [Cache Guide](./CACHE_GUIDE.md) - Redis setup
- [Database Switching Guide](./DATABASE_SWITCHING_GUIDE.md)

