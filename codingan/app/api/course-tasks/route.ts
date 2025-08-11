// app/api/course-tasks/route.ts
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
  console.log('API called: GET /api/course-tasks');
  
  let connection;
  try {
    console.log('Attempting to connect to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');

    const [rows] = await connection.execute(
      'SELECT * FROM course_tasks ORDER BY due_date ASC'
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
        { message: 'Table course_tasks does not exist' },
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