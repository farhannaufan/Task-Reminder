// // app/api/cron/status/route.ts (New - for monitoring cron jobs)
// import { NextResponse } from 'next/server';
// import cronService from '@/services/cronService';

// export async function GET() {
//   try {
//     const status = cronService.getStatus();
//     return NextResponse.json({
//       status: 'OK',
//       timestamp: new Date().toISOString(),
//       cronService: status
//     });
//   } catch (error: any) {
//     return NextResponse.json(
//       { 
//         status: 'ERROR',
//         error: error instanceof Error ? error.message : 'Unknown error',
//         timestamp: new Date().toISOString()
//       },
//       { status: 500 }
//     );
//   }
// }

// // Start/stop cron service
// export async function POST(request: Request) {
//   try {
//     const { action } = await request.json();
    
//     if (action === 'start') {
//       cronService.start();
//       return NextResponse.json({ message: 'Cron service started' });
//     } else if (action === 'stop') {
//       cronService.stop();
//       return NextResponse.json({ message: 'Cron service stopped' });
//     } else if (action === 'trigger') {
//       const result = await cronService.triggerReminders();
//       return NextResponse.json({ 
//         message: 'Reminders triggered manually',
//         result
//       });
//     }
    
//     return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
//   } catch (error: any) {
//     return NextResponse.json(
//       { 
//         message: 'Error controlling cron service',
//         error: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }