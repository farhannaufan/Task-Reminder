// app/api/courses/[id]/tasks/route.ts
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
  console.log('API called: GET /api/courses/' + id + '/tasks');

  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    // First, get the course to verify it exists and get its title
    const [courseRows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    );

    if (Array.isArray(courseRows) && courseRows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const course = courseRows[0];
    console.log('Course found:', course.title);

    // Get tasks for this course using the existing table structure
    // Match course_name in course_tasks with title in courses
    const [taskRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT 
        ct.*,
        c.title as course_title,
        c.instructor,
        c.category,
        c.image as course_image
       FROM course_tasks ct
       LEFT JOIN courses c ON ct.course_name = c.title
       WHERE ct.course_name = ?
       ORDER BY ct.due_date ASC`,
      [course.title]
    );

    console.log('Tasks found for course:', Array.isArray(taskRows) ? taskRows.length : 0);
    return NextResponse.json(taskRows);

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