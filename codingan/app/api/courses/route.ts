// app/api/courses/route.ts
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
  console.log('API called: GET /api/courses');
  
  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    const [rows] = await connection.execute(
      'SELECT * FROM courses ORDER BY created_at DESC'
    );

    console.log('Query executed, rows found:', Array.isArray(rows) ? rows.length : 0);
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Database error:', error);
    
    // More specific error handling
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: 'Database connection refused. Is MySQL running?' },
        { status: 500 }
      );
    }
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json(
        { message: 'Table courses does not exist' },
        { status: 500 }
      );
    }
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      return NextResponse.json(
        { message: 'Database my_lms does not exist' },
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

export async function POST(request: NextRequest) {
  console.log('API called: POST /api/courses');
  
  let connection;
  try {
    const body = await request.json();
    const {
      id,
      title,
      code,
      instructor,
      progress = 0,
      total_students = 0,
      category,
      image = '/api/placeholder/300/200',
      status = 'future',
      start_date,
      end_date,
      description
    } = body;

    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    const [result] = await connection.execute(
      `INSERT INTO courses (id, title, code, instructor, progress, total_students, category, image, status, start_date, end_date, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, code, instructor, progress, total_students, category, image, status, start_date, end_date, description]
    );

    console.log('Course created successfully');
    return NextResponse.json({ message: 'Course created successfully', result });
  } catch (error: any) {
    console.error('Database error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: 'Course with this ID already exists' },
        { status: 400 }
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