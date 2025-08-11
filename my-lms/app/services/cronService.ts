// app/services/cronService.ts
const cron = require('node-cron');
import reminderProcessor from './reminderProcessor';

class CronService {
  private jobs: Map<string, any> = new Map();
  private isRunning = false;

  start(dueDate: Date, remind_hour: number, frequency: number, ) {
    if (this.isRunning) {
      console.log('Cron service is already running');
      return;
    }

    // Run every 30 minutes during development
    const reminderJob = cron.schedule('*/30 * * * *', async () => {
      console.log('Running reminder cron job at:', new Date().toISOString());
      try {
        await reminderProcessor.processReminders();
      } catch (error) {
        console.error('Error in reminder cron job:', error);
      }
    }, {
      scheduled: false
    });

    this.jobs.set('reminders', reminderJob);
    reminderJob.start();
    
    this.isRunning = true;
    console.log('Cron service started - reminders will run every 30 minutes');
  }

  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`Stopped cron job: ${name}`);
    });
    this.jobs.clear();
    this.isRunning = false;
    console.log('Cron service stopped');
  }

  getStatus() {
    return {
      running: this.isRunning,
      jobs: Array.from(this.jobs.keys()),
      nextRun: this.isRunning ? 'Every 30 minutes' : 'Not scheduled'
    };
  }

  async triggerReminders() {
    console.log('Manually triggering reminder processing...');
    try {
      const result = await reminderProcessor.processReminders();
      console.log('Manual reminder processing completed:', result);
      return result;
    } catch (error) {
      console.error('Error in manual reminder processing:', error);
      throw error;
    }
  }
}

export default new CronService();