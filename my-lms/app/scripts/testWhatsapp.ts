// app/scripts/testWhatsApp.ts
import { 
    testSingleMessage, 
    testReminderMessage, 
    testMultipleMessages, 
    scheduleTestMessages, 
    loadTest, 
    runAllTests 
  } from '../test/whatsappService.test';
  
  async function main() {
    const args = process.argv.slice(2);
    const testType = args[0] || 'all';
    
    console.log('🎯 WhatsApp Service Test Runner');
    console.log('================================\n');
    
    switch (testType) {
      case 'single':
        await testSingleMessage();
        break;
        
      case 'reminder':
        testReminderMessage();
        break;
        
      case 'multiple':
        await testMultipleMessages();
        break;
        
      case 'schedule':
        scheduleTestMessages();
        // Keep the process alive to see scheduled messages
        setTimeout(() => {
          console.log('✅ Scheduled test completed');
          process.exit(0);
        }, 15000);
        break;
        
      case 'load':
        const count = parseInt(args[1]) || 5;
        await loadTest(count);
        break;
        
      case 'all':
      default:
        await runAllTests();
        break;
    }
  }
  
  // Handle errors gracefully
  process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled promise rejection:', error);
    process.exit(1);
  });
  
  main().catch(console.error);