import { Resend } from 'resend';
import { renderAsync } from '@react-email/components';
import React from 'react';
import { emailTemplates, EmailTemplateType } from './templates/index.ts';

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
      const result = await this.resend.emails.send({
        from: from || this.defaultFrom,
        to,
        subject,
        html,
        cc,
        bcc,
        reply_to: replyTo
      });

      if (result.error) {
        console.error('Failed to send email:', result.error);
        return { success: false, error: result.error.message };
      }

      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error('Error sending email:', error);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  async verifyConfiguration(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      // Simple test to verify the API key works
      const result = await this.resend.emails.send({
        from: 'onboarding@resend.dev',
        to: 'delivered@resend.dev',
        subject: 'API Key Verification',
        text: 'This is a test to verify the API key works.',
      });
      
      return !result.error;
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
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
}

// Create a singleton instance
export const emailService = new EmailService();
