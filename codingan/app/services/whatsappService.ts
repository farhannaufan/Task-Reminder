// app/services/whatsappService.ts
import twilio from 'twilio';

interface WhatsAppMessage {
  to: string;
  message: string;
}

class WhatsAppService {
  private client: twilio.Twilio;
  private fromNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken =  process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

    // Validate environment variables
    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not found in environment variables');
    }

    // Validate Account SID format
    if (!accountSid.startsWith('AC') || accountSid.length !== 34) {
      throw new Error(
        'Invalid Twilio Account SID format. Account SID must start with "AC" and be 34 characters long. ' +
        'Please check your TWILIO_ACCOUNT_SID environment variable.'
      );
    }

    // Validate Auth Token format (should be 32 characters)
    if (authToken.length !== 32) {
      throw new Error(
        'Invalid Twilio Auth Token format. Auth Token should be 32 characters long. ' +
        'Please check your TWILIO_AUTH_TOKEN environment variable.'
      );
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendWhatsAppMessage(data: WhatsAppMessage): Promise<boolean> {
    try {
      const message = await this.client.messages.create({
        body: data.message,
        from: this.fromNumber,
        to: `whatsapp:${data.to}`
      });

      console.log('WhatsApp message sent successfully:', message.sid);
      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  createReminderMessage(studentName: string, taskName: string, courseName: string, dueDate: string, hoursRemaining: number): string {
    return `
🔔 *Task Reminder*

Hi ${studentName}!

You have an upcoming task:

📝 *${taskName}*
📚 Course: ${courseName}
⏰ Due: ${dueDate}
🚨 Due in ${hoursRemaining} hours

Don't forget to complete your task on time. Good luck!

Best regards,
Your LMS Team
    `.trim();
  }
}

export default new WhatsAppService();