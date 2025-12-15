import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { CacheModule } from '@app/cache';
import { databaseConfig, cacheConfig } from '@app/configuration';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, cacheConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    DbModule.forRoot(),

    // Cache (for distributed locking)
    CacheModule.forRoot(),

    // Feature modules
    TasksModule,
  ],
})
export class AppModule {}

