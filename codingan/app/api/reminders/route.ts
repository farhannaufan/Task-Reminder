// app/api/reminders/route.ts
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get('student_id');

  if (!studentId) {
    return NextResponse.json(
      { message: 'Student ID is required' },
      { status: 400 }
    );
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Get reminders with course names included
    const [reminders] = await connection.execute(`
      SELECT 
        r.*,
        ct.name as course_task_name,
        ct.course_name,
        ct.due_date,
        ct.status as task_status
      FROM reminders r
      JOIN course_tasks ct ON r.course_task_id = ct.id
      WHERE r.student_id = ? 
      AND r.is_active = TRUE
      AND ct.status != 'submitted'
      ORDER BY ct.due_date ASC, r.created_at DESC
    `, [studentId]);

    return NextResponse.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

export async function POST(request: NextRequest) {
  let connection: mysql.Connection | null = null;

  try {
    const body = await request.json();
    const {
      student_id,
      course_task_id,
      course_task_name,
      course_name,
      remind_before_hours,
      frequency,
      notification_type,
      contact_info
    } = body;

    // Validate required fields
    if (!student_id || !course_task_id || !remind_before_hours || !frequency || !notification_type || !contact_info) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate notification type
    if (!['email', 'whatsapp'].includes(notification_type)) {
      return NextResponse.json(
        { message: 'Invalid notification type' },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    // Check if reminder already exists for this task and student
    const [existingReminders] = await connection.execute(`
      SELECT id FROM reminders 
      WHERE student_id = ? AND course_task_id = ? AND is_active = TRUE
    `, [student_id, course_task_id]);

    if ((existingReminders as any[]).length > 0) {
      return NextResponse.json(
        { message: 'A reminder already exists for this task' },
        { status: 409 }
      );
    }

    // Check if the task exists and is not submitted
    const [tasks] = await connection.execute(`
      SELECT id, name, course_name, due_date, status 
      FROM course_tasks 
      WHERE id = ? AND status != 'submitted'
    `, [course_task_id]);

    const taskList = tasks as any[];
    if (taskList.length === 0) {
      return NextResponse.json(
        { message: 'Task not found or already submitted' },
        { status: 404 }
      );
    }

    const task = taskList[0];

    // Check if the due date is in the future
    const dueDate = new Date(task.due_date);
    const now = new Date();
    if (dueDate < now) {
      return NextResponse.json(
        { message: 'Cannot create reminder for past due tasks' },
        { status: 400 }
      );
    }

    // Create the reminder - INCLUDING course_task_name (but not course_name as it's not in the reminders table)
    const [result] = await connection.execute(`
      INSERT INTO reminders (
        student_id, 
        course_task_id, 
        course_task_name,
        remind_before_hours, 
        frequency, 
        notification_type, 
        contact_info, 
        is_active, 
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, NOW())
    `, [
      student_id,
      course_task_id,
      task.name,        // Use the task name from database
      remind_before_hours,
      frequency,
      notification_type,
      contact_info
    ]);

    const insertResult = result as mysql.ResultSetHeader;

    // Return the created reminder with all details
    const newReminder = {
      id: insertResult.insertId,
      student_id,
      course_task_id,
      course_task_name: task.name,
      course_name: task.course_name,
      remind_before_hours,
      frequency,
      notification_type,
      contact_info,
      is_active: true,
      created_at: new Date().toISOString()
    };

    console.log('Reminder created successfully:', newReminder);

    return NextResponse.json(newReminder, { status: 201 });
  } catch (error) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// app/api/reminders/[id]/route.ts
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const reminderId = params.id;

  if (!reminderId) {
    return NextResponse.json(
      { message: 'Reminder ID is required' },
      { status: 400 }
    );
  }

  let connection: mysql.Connection | null = null;

  try {
    connection = await mysql.createConnection(dbConfig);

    // Delete the reminder
    const [result] = await connection.execute(
      'DELETE FROM reminders WHERE id = ?',
      [reminderId]
    );

    const deleteResult = result as mysql.ResultSetHeader;

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { message: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Also clean up any related logs
    await connection.execute(
      'DELETE FROM reminder_logs WHERE reminder_id = ?',
      [reminderId]
    );

    return NextResponse.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}