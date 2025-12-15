import { SetMetadata } from '@nestjs/common';
import { LockOptions } from './distributed-lock.service';

export const DISTRIBUTED_LOCK_KEY = 'distributed_lock';

/**
 * Distributed Lock Decorator
 * 
 * Prevents duplicate execution of cron jobs when multiple worker instances are running.
 * Only one instance will execute the job, others will skip.
 * 
 * @example
 * ```typescript
 * @Cron(CronExpression.EVERY_HOUR)
 * @DistributedLock({ key: 'hourly-task', ttl: 300 })
 * async handleHourlyTask() {
 *   // This will only run on one worker instance
 * }
 * ```
 */
export const DistributedLock = (options: LockOptions) => {
  return SetMetadata(DISTRIBUTED_LOCK_KEY, options);
};

