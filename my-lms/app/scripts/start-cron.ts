// scripts/start-cron.ts
import CronScheduler from './cron-scheduler';

const scheduler = new CronScheduler();

// Start the scheduler
scheduler.start();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});

// Keep the process running
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  scheduler.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  scheduler.stop();
  process.exit(1);
});

console.log('🚀 Cron scheduler is running. Press Ctrl+C to stop.');