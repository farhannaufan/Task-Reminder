// // app/startup/cronStartup.ts (Initialize cron on app start)
// import cronService from '@/services/cronService';

// export function initializeCron() {
//   if (process.env.NODE_ENV === 'development') {
//     console.log('Initializing cron service for development...');
    
//     // Start cron service after a short delay to ensure everything is loaded
//     setTimeout(() => {
//       cronService.start();
//     }, 2000);
    
//     // Graceful shutdown
//     process.on('SIGTERM', () => {
//       console.log('Received SIGTERM, stopping cron service...');
//       cronService.stop();
//     });
    
//     process.on('SIGINT', () => {
//       console.log('Received SIGINT, stopping cron service...');
//       cronService.stop();
//     });
//   }
// }