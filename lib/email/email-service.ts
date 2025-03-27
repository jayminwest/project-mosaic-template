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
  private resend: Resend | null;
  private defaultFrom: string;
  private isConfigured: boolean;

  constructor() {
    // Only initialize Resend on the server side
    const isServer = typeof window === 'undefined';
    const apiKey = isServer ? process.env.RESEND_API_KEY : null;
    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@example.com';
    this.isConfigured = !!apiKey;
    
    // Initialize Resend only if we have an API key and we're on the server
    this.resend = isServer && apiKey ? new Resend(apiKey) : null;
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      console.warn('Email sending is not supported on the client side');
      return { success: false, error: 'Email sending is not supported in browser' };
    }
    
    if (!this.isConfigured || !this.resend) {
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
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      return false;
    }
    
    if (!this.isConfigured || !this.resend) {
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
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      return { success: false, error: 'Domain management is not supported in browser' };
    }
    
    if (!this.isConfigured || !this.resend) {
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
