// scripts/test-cron.ts
import CronScheduler from './cron-scheduler';

async function testCron() {
  console.log('🧪 Testing cron job functionality...');
  
  const scheduler = new CronScheduler();
  
  try {
    // Test manual trigger
    await scheduler.triggerManually();
    console.log('✅ Manual trigger test completed');
    
    // Test with different base URL if needed
    // const prodScheduler = new CronScheduler('https://your-production-url.com');
    // await prodScheduler.triggerManually();
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCron();