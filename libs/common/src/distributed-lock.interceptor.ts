import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { DistributedLockService, LockOptions } from './distributed-lock.service';
import { DISTRIBUTED_LOCK_KEY } from './distributed-lock.decorator';

/**
 * Distributed Lock Interceptor
 * 
 * Intercepts method calls decorated with @DistributedLock() and ensures
 * only one instance executes the method at a time.
 */
@Injectable()
export class DistributedLockInterceptor implements NestInterceptor {
  private readonly logger = new Logger('DistributedLock');

  constructor(
    private readonly lockService: DistributedLockService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const handler = context.getHandler();
    const lockOptions = this.reflector.get<LockOptions>(DISTRIBUTED_LOCK_KEY, handler);

    // If no lock options, proceed normally
    if (!lockOptions) {
      return next.handle();
    }

    // Try to acquire lock
    const lockAcquired = await this.lockService.acquireLock(lockOptions);

    if (!lockAcquired) {
      this.logger.debug(`Skipping execution - lock held by another instance: ${lockOptions.key}`);
      // Return empty observable (skip execution)
      return new Observable((subscriber) => {
        subscriber.complete();
      });
    }

    // Execute handler and release lock when done
    return next.handle().pipe(
      tap({
        next: async () => {
          await this.lockService.releaseLock(lockOptions.key);
        },
        error: async () => {
          await this.lockService.releaseLock(lockOptions.key);
        },
        complete: async () => {
          // Lock will be released automatically on expiration
          // But we can release it early if the task completes
          await this.lockService.releaseLock(lockOptions.key);
        },
      }),
    );
  }
}

