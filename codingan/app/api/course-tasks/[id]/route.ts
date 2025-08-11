// app/api/course-tasks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'my_lms',
  charset: 'utf8mb4'
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('API called: GET /api/course-tasks/' + id);

  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    // Get task details with course information
    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT 
        ct.*,
        c.title as course_title,
        c.instructor,
        c.category,
        c.image as course_image
       FROM course_tasks ct
       LEFT JOIN courses c ON ct.course_name = c.title
       WHERE ct.id = ?`,
      [id]
    );

    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json(
        { message: 'Task not found' },
        { status: 404 }
      );
    }

    console.log('Task found:', id);
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Database error:', error);

    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: 'Database connection refused. Is MySQL running?' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Submit task (mark as completed) and auto-delete reminders
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('API called: PUT /api/course-tasks/' + id);

  let connection;
  try {
    const body = await request.json();
    const { action } = body;

    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    if (action === 'submit') {
      // Start transaction to ensure both operations succeed or fail together
      await connection.beginTransaction();

      try {
        // 1. Update task to mark as submitted
        const [taskUpdateResult] = await connection.execute(
          `UPDATE course_tasks 
           SET status = 'submitted', 
               submitted_at = CURRENT_TIMESTAMP,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [id]
        );

        console.log('Task submitted successfully');

        // 2. Delete all reminders for this task
        const [reminderDeleteResult] = await connection.execute(
          'DELETE FROM reminders WHERE course_task_id = ?',
          [id]
        );

        const deleteResult = reminderDeleteResult as mysql.ResultSetHeader;
        const deletedReminders = deleteResult.affectedRows;
        
        console.log(`Deleted ${deletedReminders} reminders for task ${id}`);

        // 3. Also delete related reminder logs (optional - keeps database clean)
        if (deletedReminders > 0) {
          // First get the reminder IDs that were deleted (we need to do this before deletion)
          // Since we already deleted them, we'll delete logs based on task reference
          // Note: This assumes you might want to clean up logs too
          await connection.execute(
            `DELETE rl FROM reminder_logs rl 
             LEFT JOIN reminders r ON rl.reminder_id = r.id 
             WHERE r.id IS NULL`
          );
          console.log('Cleaned up orphaned reminder logs');
        }

        // Commit the transaction
        await connection.commit();

        return NextResponse.json({ 
          message: 'Task submitted successfully', 
          taskUpdateResult,
          deletedReminders: deletedReminders,
          details: `Task submitted and ${deletedReminders} related reminders deleted`
        });

      } catch (transactionError) {
        // Rollback transaction on error
        await connection.rollback();
        throw transactionError;
      }
    }

    return NextResponse.json(
      { message: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Database error:', error);

    return NextResponse.json(
      { 
        message: 'Internal server error',
        error: error.message 
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Helper function to delete reminders for a specific task (can be called from other parts of your app)
export async function deleteRemindersForTask(taskId: string): Promise<number> {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'DELETE FROM reminders WHERE course_task_id = ?',
      [taskId]
    );

    const deleteResult = result as mysql.ResultSetHeader;
    console.log(`Deleted ${deleteResult.affectedRows} reminders for task ${taskId}`);
    
    return deleteResult.affectedRows;
  } catch (error) {
    console.error('Error deleting reminders for task:', error);
    return 0;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}