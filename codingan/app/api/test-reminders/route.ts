// app/api/test-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import reminderProcessor from '@/services/reminderProcessor';
import emailService from '@/services/emailService';

export async function GET(request: NextRequest) {
  console.log('API called: GET /api/test-reminders');
  
  try {
    // Test email connection first
    console.log('Testing email connection...');
    const emailConnected = await emailService.testConnection();
    
    if (!emailConnected) {
      return NextResponse.json({
        success: false,
        message: 'Email service connection failed. Please check your SMTP configuration.',
        checks: {
          emailConnection: false,
          databaseConnection: false,
          reminders: []
        }
      }, { status: 500 });
    }

    // Test database connection
    console.log('Testing database connection...');
    await reminderProcessor.connect();
    
    // Test reminder processing
    console.log('Testing reminder processing...');
    const result = await reminderProcessor.processReminders();
    
    await reminderProcessor.disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Test completed successfully',
      checks: {
        emailConnection: emailConnected,
        databaseConnection: true,
        processingResult: result
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Test failed:', error);
    
    // Clean up connection
    try {
      await reminderProcessor.disconnect();
    } catch (e) {
      console.error('Error disconnecting:', e);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error.message,
      checks: {
        emailConnection: false,
        databaseConnection: false,
        reminders: []
      },
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST endpoint for manual testing
export async function POST(request: NextRequest) {
  console.log('API called: POST /api/test-reminders');
  
  try {
    const body = await request.json();
    const { sendTestEmail, testEmail } = body;
    
    if (sendTestEmail && testEmail) {
      console.log(`Sending test email to: ${testEmail}`);
      
      const testEmailHTML = emailService.createReminderEmailHTML(
        'Test Student',
        'Test Assignment',
        'Test Course',
        'Tomorrow at 11:59 PM',
        24
      );
      
      const emailSent = await emailService.sendEmail({
        to: testEmail,
        subject: '🧪 Test Reminder Email',
        html: testEmailHTML
      });
      
      return NextResponse.json({
        success: emailSent,
        message: emailSent ? 'Test email sent successfully' : 'Failed to send test email',
        testEmail: testEmail,
        timestamp: new Date().toISOString()
      });
    }
    
    // If no test email, run normal processing
    await reminderProcessor.connect();
    const result = await reminderProcessor.processReminders();
    await reminderProcessor.disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Manual reminder processing completed',
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Manual test failed:', error);
    
    try {
      await reminderProcessor.disconnect();
    } catch (e) {
      console.error('Error disconnecting:', e);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Manual test failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}