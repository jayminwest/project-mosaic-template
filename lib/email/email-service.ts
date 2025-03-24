import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';
import { emailTemplates, EmailTemplateType } from './templates';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: EmailTemplateType;
  props?: Record<string, any>;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

export class EmailService {
  private resend: Resend;
  private defaultFrom: string;
  private isConfigured: boolean;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@example.com';
    this.isConfigured = !!apiKey;
    
    this.resend = new Resend(apiKey);
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured) {
      console.warn('Email service not configured. Set RESEND_API_KEY in your environment variables.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { to, subject, template, props = {}, from, cc, bcc, replyTo } = options;
      
      // Get the React component for the template
      const EmailTemplate = emailTemplates[template];
      if (!EmailTemplate) {
        throw new Error(`Email template "${template}" not found`);
      }

      // Render the React component to HTML
      const html = await renderAsync(EmailTemplate(props));

      // Send the email
      const { data, error } = await this.resend.emails.send({
        from: from || this.defaultFrom,
        to,
        subject,
        html,
        cc,
        bcc,
        reply_to: replyTo
      });

      if (error) {
        console.error('Failed to send email:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.id };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      // Check if we can connect to the API
      const { data, error } = await this.resend.domains.list();
      return !error && !!data;
    } catch (error) {
      console.error('Failed to verify email configuration:', error);
      return false;
    }
  }

  // Helper method to programmatically add a domain
  async addDomain(domain: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured) {
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const { data, error } = await this.resend.domains.create({ name: domain });
      
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
