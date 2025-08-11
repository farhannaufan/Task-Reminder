// app/api/cron/process-reminders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import ReminderProcessor from '../../../services/reminderProcessor';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Processing reminders via cron job...');
    
    const result = await ReminderProcessor.processReminders();
    
    if (result.success) {
      const message = result.processed > 0 
        ? `Successfully processed ${result.processed} out of ${result.total} reminders`
        : `No reminders due at this time (checked ${result.total} active reminders)`;
        
      return NextResponse.json({
        success: true,
        message,
        processed: result.processed,
        total: result.total,
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to process reminders',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in cron reminder processing:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during reminder processing',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}