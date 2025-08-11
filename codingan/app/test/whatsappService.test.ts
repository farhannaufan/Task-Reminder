// app/test/whatsappService.test.ts

import whatsappService from "../services/whatsappService";

// 1. Simple Manual Test Function
export async function testSingleMessage() {
  console.log('🧪 Testing single WhatsApp message...');
  
  const testMessage = {
    to: '+6281212820568', // Replace with your test phone number
    message: 'Hello! This is a test message from your LMS system. 📱'
  };

  try {
    const result = await whatsappService.sendWhatsAppMessage(testMessage);
    console.log('✅ Test result:', result ? 'SUCCESS' : 'FAILED');
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// 2. Test Reminder Message Format
export function testReminderMessage() {
  console.log('🧪 Testing reminder message format...');
  
  const reminderMessage = whatsappService.createReminderMessage(
    'John Doe',
    'Submit Final Project',
    'Web Development Course',
    '2025-07-16 23:59',
    12
  );
  
  console.log('📝 Generated reminder message:');
  console.log(reminderMessage);
  
  return reminderMessage;
}

// 3. Automated Test with Multiple Messages
export async function testMultipleMessages() {
  console.log('🧪 Testing multiple messages...');
  
  const testMessages = [
    {
      to: '+6281212820568', // Replace with your test numbers
      message: 'Test message 1: Basic notification'
    },
    {
      to: '+6287722554720', // Different number for testing
      message: whatsappService.createReminderMessage(
        'Farhan',
        'Quiz Submission',
        'Mathematics',
        '2025-07-17 14:00',
        24
      )
    }
  ];

  const results = [];
  
  for (let i = 0; i < testMessages.length; i++) {
    console.log(`Sending message ${i + 1}/${testMessages.length}...`);
    
    try {
      const result = await whatsappService.sendWhatsAppMessage(testMessages[i]);
      results.push({ index: i, success: result, message: testMessages[i] });
      
      // Add delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Message ${i + 1} failed:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      results.push({ index: i, success: false, error: errorMessage });
    }
  }
  
  console.log('📊 Test Results Summary:');
  results.forEach((result, index) => {
    console.log(`Message ${index + 1}: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  });
  
  return results;
}

// 4. Scheduled Test Function (simulates automatic sending)
export function scheduleTestMessages() {
  console.log('⏰ Scheduling test messages...');
  
  // Test immediate send
  setTimeout(async () => {
    console.log('📤 Sending scheduled message 1...');
    await testSingleMessage();
  }, 5000); // 5 seconds

  // Test delayed send
  setTimeout(async () => {
    console.log('📤 Sending scheduled message 2...');
    const reminderMsg = whatsappService.createReminderMessage(
      'Scheduled Test User',
      'Scheduled Task',
      'Test Course',
      '2025-07-16 10:00',
      2
    );
    
    await whatsappService.sendWhatsAppMessage({
      to: '+6281212820568', // Replace with your number
      message: reminderMsg
    });
  }, 10000); // 10 seconds
  
  console.log('⏳ Messages scheduled. Check your phone in 5 and 10 seconds...');
}

// 5. Load Test Function
export async function loadTest(messageCount: number = 5) {
  console.log(`🏋️ Load testing with ${messageCount} messages...`);
  
  const promises = [];
  const startTime = Date.now();
  
  for (let i = 0; i < messageCount; i++) {
    const testMessage = {
      to: '+6281212820568', // Replace with your number
      message: `Load test message ${i + 1}/${messageCount} - ${new Date().toISOString()}`
    };
    
    promises.push(whatsappService.sendWhatsAppMessage(testMessage));
  }
  
  try {
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const successCount = results.filter(r => r === true).length;
    const failureCount = results.filter(r => r === false).length;
    
    console.log(`📊 Load Test Results:`);
    console.log(`   Total Messages: ${messageCount}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Failed: ${failureCount}`);
    console.log(`   Duration: ${duration}ms`);
    console.log(`   Average: ${duration / messageCount}ms per message`);
    
    return { successCount, failureCount, duration, averageTime: duration / messageCount };
  } catch (error) {
    console.error('❌ Load test failed:', error);
    return null;
  }
}

// 6. Main Test Runner
export async function runAllTests() {
  console.log('🚀 Starting WhatsApp Service Tests...\n');
  
  try {
    // Test 1: Single message
    console.log('=== Test 1: Single Message ===');
    await testSingleMessage();
    console.log('\n');
    
    // Test 2: Reminder message format
    console.log('=== Test 2: Reminder Message Format ===');
    testReminderMessage();
    console.log('\n');
    
    // Test 3: Multiple messages
    console.log('=== Test 3: Multiple Messages ===');
    await testMultipleMessages();
    console.log('\n');
    
    // Test 4: Scheduled messages
    console.log('=== Test 4: Scheduled Messages ===');
    scheduleTestMessages();
    console.log('\n');
    
    // Test 5: Load test
    console.log('=== Test 5: Load Test ===');
    await loadTest(3);
    console.log('\n');
    
    console.log('✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}