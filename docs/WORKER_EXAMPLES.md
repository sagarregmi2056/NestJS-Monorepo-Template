# Worker Examples & Guide

This document explains how the worker service works and provides practical examples.

## 🎯 What is a Worker?

A **worker** is a background service that:
- ❌ **Does NOT** have an HTTP server (no REST API)
- ✅ **Does** run scheduled tasks (cron jobs)
- ✅ **Does** process background jobs
- ✅ **Does** handle long-running tasks
- ✅ **Does** run independently from your API servers

## 🏗️ How It Works

### 1. Application Context (No HTTP Server)

Unlike `api-server` which uses `NestFactory.create()`, the worker uses `NestFactory.createApplicationContext()`:

```typescript
// apps/worker/src/main.ts
const app = await NestFactory.createApplicationContext(AppModule);
// No HTTP server - just runs in the background!
```

### 2. Scheduled Tasks (Cron Jobs)

Use `@nestjs/schedule` to run tasks at specific times:

```typescript
@Cron(CronExpression.EVERY_30_SECONDS)
handleTask() {
  // Runs every 30 seconds
}

@Cron('0 2 * * *') // Every day at 2 AM
handleDailyTask() {
  // Runs daily at 2:00 AM
}
```

### 3. Graceful Shutdown

The worker handles shutdown signals properly:

```typescript
process.on('SIGINT', async () => {
  logger.log('Shutting down worker...');
  await app.close();
  process.exit(0);
});
```

## 📋 Example Tasks

### Example 1: Periodic Health Check

```typescript
@Cron(CronExpression.EVERY_30_SECONDS)
checkSystemHealth() {
  const memory = process.memoryUsage();
  if (memory.heapUsed > 500 * 1024 * 1024) {
    this.logger.warn('High memory usage!');
  }
}
```

### Example 2: Daily Cleanup

```typescript
@Cron('0 2 * * *') // 2 AM daily
async cleanOldData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Delete old logs
  await this.logRepository.delete({
    createdAt: { $lt: thirtyDaysAgo }
  });
}
```

### Example 3: Process Queue

```typescript
@Cron(CronExpression.EVERY_MINUTE)
async processEmailQueue() {
  const pendingEmails = await this.emailQueue.find({
    status: 'pending',
    scheduledAt: { $lte: new Date() }
  });
  
  for (const email of pendingEmails) {
    await this.sendEmail(email);
    await this.emailQueue.update(email.id, { status: 'sent' });
  }
}
```

### Example 4: Sync External Data

```typescript
@Cron(CronExpression.EVERY_HOUR)
async syncExternalData() {
  // Fetch from external API
  const data = await this.externalApi.fetch();
  
  // Update local database
  await this.dataRepository.sync(data);
}
```

### Example 5: Generate Reports

```typescript
@Cron('0 9 * * 1') // Every Monday at 9 AM
async generateWeeklyReport() {
  const stats = await this.calculateWeeklyStats();
  await this.emailService.sendReport(stats);
}
```

## 🚀 Running the Worker

### Start Worker

```bash
npm run start:dev:worker
```

### What You'll See

```
[Worker] 🚀 Worker service is running...
[TasksService] ⏰ Running periodic task every 30 seconds...
[TasksService] 🧹 Starting daily cleanup task...
```

## 🔧 Cron Expression Examples

| Expression | Description |
|------------|-------------|
| `CronExpression.EVERY_SECOND` | Every second |
| `CronExpression.EVERY_30_SECONDS` | Every 30 seconds |
| `CronExpression.EVERY_MINUTE` | Every minute |
| `CronExpression.EVERY_HOUR` | Every hour |
| `CronExpression.EVERY_DAY_AT_MIDNIGHT` | Daily at midnight |
| `'0 2 * * *'` | Every day at 2:00 AM |
| `'0 9 * * 1'` | Every Monday at 9:00 AM |
| `'0 */6 * * *'` | Every 6 hours |
| `'0 0 1 * *'` | First day of every month |

### Cron Format

```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Day of week (0-7, 0 or 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

## 💡 Common Use Cases

### 1. **Email Queue Processing**
- Process pending emails
- Retry failed emails
- Clean old email logs

### 2. **Data Cleanup**
- Delete old logs
- Archive old records
- Clean temporary files

### 3. **Scheduled Reports**
- Daily summaries
- Weekly reports
- Monthly analytics

### 4. **External API Sync**
- Sync user data
- Update product catalog
- Fetch exchange rates

### 5. **Cache Management**
- Refresh cache
- Invalidate expired cache
- Warm up cache

### 6. **Notification Processing**
- Send push notifications
- Process SMS queue
- Handle webhooks

## 🔄 Worker vs API Server

| Feature | Worker | API Server |
|---------|--------|------------|
| HTTP Server | ❌ No | ✅ Yes |
| REST API | ❌ No | ✅ Yes |
| Scheduled Tasks | ✅ Yes | ❌ No |
| Background Jobs | ✅ Yes | ✅ Yes (but not recommended) |
| Port | N/A | 3000+ |
| Use Case | Background processing | Handle requests |

## 📝 Best Practices

### 1. **Error Handling**

Always wrap tasks in try-catch:

```typescript
@Cron(CronExpression.EVERY_HOUR)
async handleTask() {
  try {
    await this.processData();
  } catch (error) {
    this.logger.error(`Task failed: ${error.message}`);
    // Optionally: Send alert, retry, etc.
  }
}
```

### 2. **Logging**

Log important events:

```typescript
this.logger.log('Starting task...');
this.logger.debug('Processing item 1...');
this.logger.error('Task failed!');
```

### 3. **Database Connections**

Worker can use the same database as API server:

```typescript
@Module({
  imports: [
    DbModule.forRoot(), // Same database connection
    // ...
  ],
})
```

### 4. **Long-Running Tasks**

For long tasks, consider breaking them into chunks:

```typescript
async processLargeDataset() {
  const batchSize = 100;
  let offset = 0;
  
  while (true) {
    const items = await this.getItems(offset, batchSize);
    if (items.length === 0) break;
    
    await this.processBatch(items);
    offset += batchSize;
  }
}
```

### 5. **Graceful Shutdown**

Handle shutdown signals:

```typescript
process.on('SIGINT', async () => {
  // Finish current tasks
  await this.finishCurrentTasks();
  // Close database connections
  await app.close();
  process.exit(0);
});
```

## 🐛 Troubleshooting

### Worker Not Running

1. Check if worker is started:
   ```bash
   npm run start:dev:worker
   ```

2. Check logs for errors

3. Verify `ScheduleModule` is imported

### Tasks Not Executing

1. Check cron expression syntax
2. Verify `@Cron()` decorator is on a method
3. Ensure service is provided in module
4. Check timezone settings

### Memory Issues

1. Process items in batches
2. Use streaming for large datasets
3. Monitor memory usage
4. Consider using queue systems (Bull, BullMQ)

## 📚 Related Documentation

- [NestJS Schedule Documentation](https://docs.nestjs.com/techniques/task-scheduling)
- [Cron Expression Guide](https://crontab.guru/)
- [ARCHITECTURE.md](../ARCHITECTURE.md) - Overall architecture

## 🎯 Next Steps

1. **Add your tasks** to `tasks.service.ts`
2. **Configure cron schedules** for your needs
3. **Add database operations** if needed
4. **Set up error handling** and logging
5. **Deploy worker** separately from API server

Happy coding! 🚀

