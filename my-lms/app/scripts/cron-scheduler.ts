// scripts/cron-scheduler.ts
import cron, { ScheduledTask } from 'node-cron';
import fetch from 'node-fetch';

class CronScheduler {
  private baseUrl: string;
  private isRunning = false;
  private scheduledTasks: ScheduledTask[] = [];

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  start() {
    if (this.isRunning) {
      console.log('Cron scheduler is already running');
      return;
    }

    console.log('Starting cron scheduler...');
    this.isRunning = true;

    // Schedule to run every minute for more precise timing
    // This ensures reminders are sent within 1 minute of their scheduled time
    const task = cron.schedule('* * * * *', async () => {
      const now = new Date();
      console.log('⏰ Cron job triggered at:', now.toLocaleString());
      await this.triggerReminderProcessing();
    });

    this.scheduledTasks.push(task);

    console.log('✅ Cron scheduler started successfully');
    console.log('📅 Reminders will be processed every minute for precise timing');
    console.log('🔔 Notifications will be sent at the exact scheduled time before task deadlines');
  }

  private async triggerReminderProcessing() {
    try {
      const response = await fetch(`${this.baseUrl}/api/cron/process-reminders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json() as { message: string; processed?: number; total?: number };
      
      if (response.ok) {
        if (result.processed && result.processed > 0) {
          console.log(`✅ Reminder processing completed: ${result.message} (Processed: ${result.processed}/${result.total})`);
        } else {
          // Only log when reminders are actually processed to reduce console noise
          // console.log('⏸️  No reminders due at this time');
        }
      } else {
        console.error('❌ Reminder processing failed:', result.message);
      }
    } catch (error) {
      console.error('❌ Error triggering reminder processing:', error);
    }
  }

  stop() {
    if (!this.isRunning) {
      console.log('Cron scheduler is not running');
      return;
    }

    console.log('Stopping cron scheduler...');
    this.isRunning = false;
    
    // Destroy all scheduled tasks
    this.scheduledTasks.forEach(task => {
      task.destroy();
    });
    
    this.scheduledTasks = [];
    console.log('✅ Cron scheduler stopped');
  }

  // Manual trigger for testing
  async triggerManually() {
    console.log('🔧 Manually triggering reminder processing...');
    await this.triggerReminderProcessing();
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      activeTasksCount: this.scheduledTasks.length,
      baseUrl: this.baseUrl
    };
  }

  // Set custom schedule (for testing or different environments)
  setCustomSchedule(cronExpression: string) {
    if (this.isRunning) {
      this.stop();
    }

    console.log(`Setting custom cron schedule: ${cronExpression}`);
    this.isRunning = true;

    const task = cron.schedule(cronExpression, async () => {
      console.log('⏰ Custom cron job triggered at:', new Date().toLocaleString());
      await this.triggerReminderProcessing();
    });

    this.scheduledTasks.push(task);
    console.log('✅ Custom cron scheduler started successfully');
  }
}

export default CronScheduler;