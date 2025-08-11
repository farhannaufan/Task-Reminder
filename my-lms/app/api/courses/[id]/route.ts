// app/api/courses/[id]/route.ts
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
  console.log('API called: GET /api/courses/' + id);

  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    const [rows] = await connection.execute<mysql.RowDataPacket[]>(
      'SELECT * FROM courses WHERE id = ?',
      [id]
    );

    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    console.log('Course found:', id);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('API called: PUT /api/courses/' + id);

  let connection;
  try {
    const body = await request.json();
    const {
      title,
      code,
      instructor,
      progress,
      total_students,
      category,
      image,
      status,
      start_date,
      end_date,
      description
    } = body;

    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    const [result] = await connection.execute(
      `UPDATE courses 
       SET title = ?, code = ?, instructor = ?, progress = ?, total_students = ?, 
           category = ?, image = ?, status = ?, start_date = ?, end_date = ?, 
           description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, code, instructor, progress, total_students, category, image, status, start_date, end_date, description, id]
    );

    console.log('Course updated successfully');
    return NextResponse.json({ message: 'Course updated successfully', result });
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('API called: DELETE /api/courses/' + id);

  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    const [result] = await connection.execute(
      'DELETE FROM courses WHERE id = ?',
      [id]
    );

    console.log('Course deleted successfully');
    return NextResponse.json({ message: 'Course deleted successfully', result });
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