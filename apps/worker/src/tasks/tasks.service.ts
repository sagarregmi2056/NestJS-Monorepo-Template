import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DistributedLock } from '@app/common';

/**
 * Tasks Service - Example Worker Tasks
 * 
 * This service demonstrates various types of background jobs:
 * 1. Scheduled tasks (cron jobs)
 * 2. Periodic cleanup tasks
 * 3. Data processing tasks
 * 4. Notification tasks
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  /**
   * Example 1: Scheduled Task - Runs every 30 seconds
   * Use cases: Health checks, monitoring, periodic updates
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  handlePeriodicTask() {
    this.logger.debug('Running periodic task every 30 seconds...');
    // Example: Check system health, update cache, etc.
    this.checkSystemHealth();
  }

  /**
   * Example 2: Daily Cleanup - Runs every day at 2 AM
   * Use cases: Clean old logs, archive data, delete expired sessions
   */
  @Cron('0 2 * * *') // Every day at 2:00 AM
  @DistributedLock({ key: 'daily-cleanup', ttl: 3600 }) // Lock for 1 hour
  async handleDailyCleanup() {
    this.logger.log('Starting daily cleanup task...');
    try {
      // Example: Clean old logs
      await this.cleanOldLogs();
      
      // Example: Archive old data
      await this.archiveOldData();
      
      this.logger.log('Daily cleanup completed');
    } catch (error) {
      this.logger.error(`Daily cleanup failed: ${error.message}`);
    }
  }

  /**
   * Example 3: Hourly Task - Runs every hour
   * Use cases: Send reports, sync data, process pending items
   */
  @Cron(CronExpression.EVERY_HOUR)
  @DistributedLock({ key: 'hourly-task', ttl: 300 }) // Lock for 5 minutes
  async handleHourlyTask() {
    this.logger.log('Running hourly task...');
    try {
      // Example: Process pending notifications
      await this.processPendingNotifications();
      
      // Example: Sync external data
      await this.syncExternalData();
    } catch (error) {
      this.logger.error(`Hourly task failed: ${error.message}`);
    }
  }

  /**
   * Example 4: Weekly Report - Runs every Monday at 9 AM
   * Use cases: Generate weekly reports, send summaries
   */
  @Cron('0 9 * * 1') // Every Monday at 9:00 AM
  @DistributedLock({ key: 'weekly-report', ttl: 1800 }) // Lock for 30 minutes
  async handleWeeklyReport() {
    this.logger.log('Generating weekly report...');
    try {
      const report = await this.generateWeeklyReport();
      await this.sendWeeklyReport(report);
      this.logger.log('Weekly report sent');
    } catch (error) {
      this.logger.error(`Weekly report failed: ${error.message}`);
    }
  }

  // ========== Helper Methods (Examples) ==========

  /**
   * Check system health
   */
  private checkSystemHealth() {
    const memoryUsage = process.memoryUsage();
    const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
    
    if (memoryMB > 500) {
      this.logger.warn(`High memory usage: ${memoryMB}MB`);
    }
    
    // Example: Check database connection, external services, etc.
  }

  /**
   * Clean old logs (example)
   */
  private async cleanOldLogs() {
    this.logger.log('Cleaning logs older than 30 days...');
    // Example implementation:
    // const thirtyDaysAgo = new Date();
    // thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    // await this.logRepository.delete({ createdAt: { $lt: thirtyDaysAgo } });
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log('Old logs cleaned');
  }

  /**
   * Archive old data (example)
   */
  private async archiveOldData() {
    this.logger.log('Archiving data older than 90 days...');
    // Example: Move old records to archive collection/table
    // await this.dataRepository.archive({ createdAt: { $lt: ninetyDaysAgo } });
    
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log('Data archived');
  }

  /**
   * Process pending notifications (example)
   */
  private async processPendingNotifications() {
    this.logger.log('Processing pending notifications...');
    
    // Example: Fetch pending notifications from database
    // const pendingNotifications = await this.notificationRepository.find({
    //   status: 'pending',
    //   scheduledAt: { $lte: new Date() }
    // });
    
    // Example: Send each notification
    // for (const notification of pendingNotifications) {
    //   await this.sendNotification(notification);
    //   await this.notificationRepository.update(notification.id, { status: 'sent' });
    // }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log('Notifications processed');
  }

  /**
   * Sync external data (example)
   */
  private async syncExternalData() {
    this.logger.log('Syncing external data...');
    
    // Example: Fetch data from external API
    // const externalData = await this.externalApiService.fetchData();
    // await this.dataRepository.sync(externalData);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    this.logger.log('External data synced');
  }

  /**
   * Generate weekly report (example)
   */
  private async generateWeeklyReport() {
    this.logger.log('Generating report data...');
    
    // Example: Aggregate data for the week
    // const startDate = new Date();
    // startDate.setDate(startDate.getDate() - 7);
    // const stats = await this.statsRepository.aggregate({
    //   date: { $gte: startDate }
    // });
    
    const report = {
      period: 'Last 7 days',
      totalUsers: 0, // stats.totalUsers
      totalOrders: 0, // stats.totalOrders
      revenue: 0, // stats.revenue
      generatedAt: new Date(),
    };
    
    return report;
  }

  /**
   * Send weekly report (example)
   */
  private async sendWeeklyReport(report: any) {
    this.logger.log('Sending weekly report...');
    
    // Example: Send email
    // await this.emailService.send({
    //   to: 'admin@example.com',
    //   subject: 'Weekly Report',
    //   template: 'weekly-report',
    //   data: report
    // });
    
    this.logger.log(`Report sent: ${JSON.stringify(report)}`);
  }

  /**
   * Manual task trigger (can be called from API or other services)
   */
  async processQueue() {
    this.logger.log('Processing queue...');
    
    // Example: Process items from a queue
    // const queueItems = await this.queueService.getPendingItems();
    // for (const item of queueItems) {
    //   await this.processQueueItem(item);
    // }
    
    this.logger.log('Queue processed');
  }
}

