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

export async function DELETE(request: NextRequest) {
    console.log('API called: DELETE /api/reminders');
    
    let connection;
    try {
      console.log('Attempting to connect to database...');
      connection = await mysql.createConnection(dbConfig);
      console.log('Database connected successfully');
  
      const url = new URL(request.url);
      console.log('URL:', url);
      const id = url.pathname.split('/').pop(); 
      console.log('Deleting reminder with ID:', id);
  
      if (!id) {
        return NextResponse.json(
          { message: 'Reminder ID is required' },
          { status: 400 }
        );
      }
  
      console.log('Deleting reminder with ID:', id);
  
      const [result] = await connection.execute(
        'DELETE FROM reminders WHERE id = ?',
        [id]
      );
  
      const deleteResult = result as mysql.ResultSetHeader;
      console.log('Reminder deletion result:', deleteResult);
      if (deleteResult.affectedRows > 0) {
        return NextResponse.json({ message: 'Reminder deleted successfully' });
      } else {
        return NextResponse.json(
          { message: 'Reminder not found or already inactive' },
          { status: 404 }
        );
      }
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
          { message: 'Table reminders does not exist' },
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