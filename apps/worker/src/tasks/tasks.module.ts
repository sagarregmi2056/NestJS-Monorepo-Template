import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { DistributedLockService, DistributedLockInterceptor } from '@app/common';
import { TasksService } from './tasks.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    TasksService,
    DistributedLockService,
    {
      provide: APP_INTERCEPTOR,
      useClass: DistributedLockInterceptor,
    },
  ],
})
export class TasksModule {}

