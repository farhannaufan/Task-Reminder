// app/api/cron/reminders/route.ts (Updated)
import { NextRequest, NextResponse } from 'next/server';
import reminderProcessor from '@/services/reminderProcessor';

export async function POST(request: NextRequest) {
  console.log('API called: POST /api/cron/reminders');

  try {
    // Optional: Add authentication/authorization here
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET || 'dev-secret-token';
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await reminderProcessor.processReminders();
    
    return NextResponse.json({ 
      message: 'Reminders processed successfully',
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    console.error('Error in cron job:', error);
    
    return NextResponse.json(
      { 
        message: 'Error processing reminders',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// For manual testing
export async function GET() {
  try {
    const result = await reminderProcessor.processReminders();
    return NextResponse.json({ 
      message: 'Manual reminder processing completed',
      timestamp: new Date().toISOString(),
      result
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        message: 'Error processing reminders',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}