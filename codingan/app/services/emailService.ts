// app/services/emailService.ts
import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailData {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Configure your email settings here
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    };

    console.log('Email configuration:', {
      host: config.host,
      port: config.port,
      secure: config.secure,
      user: config.auth.user,
      pass: config.auth.pass ? '***masked***' : 'not set'
    });

    this.transporter = nodemailer.createTransport(config);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log(`Attempting to send email to: ${emailData.to}`);
      
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'LMS Reminder System <noreply@lms.com>',
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html
      });

      console.log('Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  createReminderEmailHTML(studentName: string, taskName: string, courseName: string, dueDate: string, hoursRemaining: number): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Reminder</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #dc2626;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .task-info {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
          }
          .task-name {
            font-size: 20px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
          }
          .course-name {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 5px;
          }
          .due-date {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 15px;
          }
          .urgency {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            text-align: center;
            padding: 10px;
            background-color: #fef2f2;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .button {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📚 Task Reminder</h1>
        </div>
        
        <div class="content">
          <p>Hi <strong>${studentName}</strong>!</p>
          
          <p>This is a friendly reminder about your upcoming task:</p>
          
          <div class="task-info">
            <div class="task-name">${taskName}</div>
            <div class="course-name"><strong>Course:</strong> ${courseName}</div>
            <div class="due-date"><strong>Due Date:</strong> ${dueDate}</div>
            <div class="urgency">⏰ Due in ${hoursRemaining} hours</div>
          </div>
          
          <p>Don't forget to complete your task on time. Good luck!</p>
          
          <p>Best regards,<br>
          Your LMS Team</p>
        </div>
        
        <div class="footer">
          <p>This is an automated reminder from your LMS system.</p>
        </div>
      </body>
      </html>
    `;
  }
}

export default new EmailService();