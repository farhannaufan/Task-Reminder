// app/services/reminderProcessor.ts
import mysql from 'mysql2/promise';
import EmailService from './emailService';
import WhatsAppService from './whatsappService';

const dbConfig = {
  host: 'localhost',
  port: 8889,
  user: 'root',
  password: 'root',
  database: 'my_lms',
  charset: 'utf8mb4'
};

interface ReminderWithTask {
  id: number;
  student_id: number;
  student_name: string;
  course_task_id: string;
  course_task_name: string;
  course_name: string;
  due_date: string;
  remind_before_hours: number;
  frequency: number;
  notification_type: 'email' | 'whatsapp';
  contact_info: string;
  created_at: string;
  task_status: string;
}

interface ReminderLog {
  reminder_id: number;
  sent_at: string;
}

class ReminderProcessor {
  private connection: mysql.Connection | null = null;

  async connect() {
    if (!this.connection) {
      try {
        this.connection = await mysql.createConnection(dbConfig);
        console.log('Database connected successfully');
      } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
      }
    }
  }

  async disconnect() {
    if (this.connection) {
      try {
        await this.connection.end();
        this.connection = null;
        console.log('Database disconnected');
      } catch (error) {
        console.error('Error disconnecting from database:', error);
      }
    }
  }

  async processReminders() {
    let connection: mysql.Connection | null = null;
    
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log('Processing reminders...');
      
      // First, clean up reminders for submitted or overdue tasks
      await this.cleanupObsoleteReminders(connection);
      
      // Get reminders that are due to be sent right now (within the current minute)
      const [reminders] = await connection.execute(`
        SELECT 
          r.*,
          s.name as student_name,
          ct.name as course_task_name,
          ct.course_name,
          ct.due_date,
          ct.status as task_status,
          DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR) as reminder_time
        FROM reminders r
        JOIN students s ON r.student_id = s.id
        JOIN course_tasks ct ON r.course_task_id = ct.id
        WHERE r.is_active = TRUE
        AND ct.status != 'submitted'
        AND ct.due_date > DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR) <= NOW()
        AND DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR) > DATE_SUB(NOW(), INTERVAL 1 MINUTE)
      `);

      const reminderList = reminders as (ReminderWithTask & { reminder_time: string })[];
      console.log(`Found ${reminderList.length} reminders due for processing`);

      let processedCount = 0;
      for (const reminder of reminderList) {
        const processed = await this.processIndividualReminder(reminder, connection);
        if (processed) processedCount++;
      }

      console.log(`Successfully processed ${processedCount} out of ${reminderList.length} reminders`);
      return { success: true, processed: processedCount, total: reminderList.length };
    } catch (error) {
      console.error('Error processing reminders:', error);
      throw error;
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  private async cleanupObsoleteReminders(connection: mysql.Connection) {
    try {
      console.log('Cleaning up obsolete reminders...');
      
      // Only delete reminders for submitted tasks (they're definitely done)
      const [submittedResult] = await connection.execute(`
        DELETE r FROM reminders r
        JOIN course_tasks ct ON r.course_task_id = ct.id
        WHERE ct.status = 'submitted'
      `);
      
      const submittedDeleted = (submittedResult as mysql.ResultSetHeader).affectedRows;
      console.log(`Deleted ${submittedDeleted} reminders for submitted tasks`);

      // For overdue tasks, only delete reminders that have completed all their notification attempts
      // or are way past due (e.g., more than 24 hours past due)
      const [overdueResult] = await connection.execute(`
        DELETE r FROM reminders r
        JOIN course_tasks ct ON r.course_task_id = ct.id
        WHERE ct.due_date < DATE_SUB(NOW(), INTERVAL 24 HOUR) 
        AND ct.status != 'submitted'
      `);
      
      const overdueDeleted = (overdueResult as mysql.ResultSetHeader).affectedRows;
      console.log(`Deleted ${overdueDeleted} reminders for tasks overdue by more than 24 hours`);

      // Clean up reminders that have completed all their notification cycles
      const [completedResult] = await connection.execute(`
        DELETE r FROM reminders r
        WHERE r.id IN (
          SELECT reminder_id FROM (
            SELECT r2.id as reminder_id, 
                   COUNT(rl.id) as sent_count,
                   r2.frequency
            FROM reminders r2
            LEFT JOIN reminder_logs rl ON r2.id = rl.reminder_id AND rl.status = 'sent'
            GROUP BY r2.id, r2.frequency
            HAVING sent_count >= r2.frequency
          ) completed_reminders
        )
      `);
      
      const completedDeleted = (completedResult as mysql.ResultSetHeader).affectedRows;
      console.log(`Deleted ${completedDeleted} reminders that completed all notification cycles`);

      // Clean up orphaned reminder logs
      const [logsResult] = await connection.execute(`
        DELETE rl FROM reminder_logs rl
        LEFT JOIN reminders r ON rl.reminder_id = r.id
        WHERE r.id IS NULL
      `);
      
      const logsDeleted = (logsResult as mysql.ResultSetHeader).affectedRows;
      console.log(`Cleaned up ${logsDeleted} orphaned reminder logs`);

      return {
        submittedReminders: submittedDeleted,
        overdueReminders: overdueDeleted,
        completedReminders: completedDeleted,
        orphanedLogs: logsDeleted
      };
    } catch (error) {
      console.error('Error cleaning up obsolete reminders:', error);
      throw error;
    }
  }

  private async processIndividualReminder(
    reminder: ReminderWithTask & { reminder_time: string }, 
    connection: mysql.Connection
  ): Promise<boolean> {
    try {
      const dueDate = new Date(reminder.due_date);
      const reminderTime = new Date(reminder.reminder_time);
      const now = new Date();
      
      console.log(`Processing reminder ${reminder.id}:`);
      console.log(`  Task: ${reminder.course_task_name}`);  
      console.log(`  Due date: ${dueDate.toLocaleString()}`);
      console.log(`  Scheduled reminder time: ${reminderTime.toLocaleString()}`);
      console.log(`  Current time: ${now.toLocaleString()}`);

      // If task is already submitted, skip
      if (reminder.task_status === 'submitted') {
        console.log(`Task ${reminder.course_task_id} is already submitted, will be cleaned up later`);
        return false;
      }

      // Check if we've already sent a reminder in the last hour to prevent duplicates
      const [recentLogs] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM reminder_logs 
        WHERE reminder_id = ? 
        AND status = 'sent' 
        AND sent_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
      `, [reminder.id]);

      const recentLogCount = (recentLogs as any)[0].count;
      
      if (recentLogCount > 0) {
        console.log(`Reminder ${reminder.id} already sent in the last hour, skipping`);
        return false;
      }

      // Check total frequency limit
      const [totalLogs] = await connection.execute(
        'SELECT COUNT(*) as count FROM reminder_logs WHERE reminder_id = ? AND status = "sent"',
        [reminder.id]
      );

      const totalLogCount = (totalLogs as any)[0].count;

      if (totalLogCount < reminder.frequency) {
        const hoursUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));
        const minutesUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60));
        
        let urgencyText: string;
        if (hoursUntilDue < 0) {
          urgencyText = `OVERDUE by ${Math.abs(hoursUntilDue)} hours`;
        } else if (hoursUntilDue === 0) {
          urgencyText = `due in ${minutesUntilDue} minutes`;
        } else {
          urgencyText = `due in ${hoursUntilDue} hours`;
        }
        
        console.log(`✅ Sending reminder ${reminder.id} (attempt ${totalLogCount + 1}/${reminder.frequency}) - ${urgencyText}`);
        
        const sent = await this.sendReminder(reminder, hoursUntilDue);
        
        // Log the attempt
        await this.logReminderAttempt(reminder.id, reminder.notification_type, reminder.contact_info, sent, connection);
        
        return sent;
      } else {
        console.log(`Reminder ${reminder.id} has reached frequency limit (${reminder.frequency}), will be cleaned up later`);
        return false;
      }
    } catch (error) {
      console.error(`Error processing reminder ${reminder.id}:`, error);
      return false;
    }
  }

  private async sendReminder(reminder: ReminderWithTask, hoursUntilDue: number): Promise<boolean> {
    const dueDate = new Date(reminder.due_date).toLocaleString();
    const isOverdue = hoursUntilDue < 0;
    const minutesUntilDue = Math.floor((new Date(reminder.due_date).getTime() - Date.now()) / (1000 * 60));

    try {
      if (reminder.notification_type === 'email') {
        let subject: string;
        if (isOverdue) {
          subject = `🚨 OVERDUE: ${reminder.course_task_name} - ${Math.abs(hoursUntilDue)} hours overdue`;
        } else if (hoursUntilDue === 0) {
          subject = `⏰ URGENT: ${reminder.course_task_name} - Due in ${minutesUntilDue} minutes`;
        } else {
          subject = `📝 Reminder: ${reminder.course_task_name} - Due in ${hoursUntilDue} hours`;
        }

        const emailHTML = EmailService.createReminderEmailHTML(
          reminder.student_name,
          reminder.course_task_name,
          reminder.course_name,
          dueDate,
          hoursUntilDue
        );

        return await EmailService.sendEmail({
          to: reminder.contact_info,
          subject: subject,
          html: emailHTML
        });
      } else if (reminder.notification_type === 'whatsapp') {
        const message = WhatsAppService.createReminderMessage(
          reminder.student_name,
          reminder.course_task_name,
          reminder.course_name,
          dueDate,
          hoursUntilDue
        );

        return await WhatsAppService.sendWhatsAppMessage({
          to: reminder.contact_info,
          message: message
        });
      }
    } catch (error) {
      console.error(`Error sending ${reminder.notification_type} reminder:`, error);
    }

    return false;
  }

  private async logReminderAttempt(
    reminderId: number,
    notificationType: 'email' | 'whatsapp',
    contactInfo: string,
    success: boolean,
    connection: mysql.Connection
  ) {
    try {
      await connection.execute(
        'INSERT INTO reminder_logs (reminder_id, notification_type, contact_info, status, sent_at) VALUES (?, ?, ?, ?, NOW())',
        [reminderId, notificationType, contactInfo, success ? 'sent' : 'failed']
      );
      
      console.log(`📝 Logged reminder attempt: ${success ? 'SUCCESS' : 'FAILED'} - ${notificationType} to ${contactInfo}`);
    } catch (error) {
      console.error('Error logging reminder attempt:', error);
    }
  }

  async deleteRemindersForTask(taskId: string): Promise<number> {
    let connection: mysql.Connection | null = null;
    
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

  // Method to get upcoming reminders for debugging
  async getUpcomingReminders(limitMinutes: number = 60) {
    let connection: mysql.Connection | null = null;
    
    try {
      connection = await mysql.createConnection(dbConfig);
      
      const [reminders] = await connection.execute(`
        SELECT 
          r.id,
          r.student_id,
          s.name as student_name,
          r.course_task_id,
          ct.name as course_task_name,
          ct.course_name,
          ct.due_date,
          r.remind_before_hours,
          DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR) as reminder_time,
          r.notification_type,
          r.contact_info,
          TIMESTAMPDIFF(MINUTE, NOW(), DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR)) as minutes_until_reminder
        FROM reminders r
        JOIN students s ON r.student_id = s.id
        JOIN course_tasks ct ON r.course_task_id = ct.id
        WHERE r.is_active = TRUE
        AND ct.status != 'submitted'
        AND DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR) > NOW()
        AND DATE_SUB(ct.due_date, INTERVAL r.remind_before_hours HOUR) <= DATE_ADD(NOW(), INTERVAL ? MINUTE)
        ORDER BY reminder_time ASC
      `, [limitMinutes]);

      return reminders;
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

export default new ReminderProcessor();