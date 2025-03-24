import { Resend } from 'resend';
import inquirer from 'inquirer';
import chalk from 'chalk';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env.local if it exists
if (fs.existsSync(path.join(process.cwd(), '.env.local'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.local') });
}

async function testEmail() {
  console.log(chalk.blue('Project Mosaic - Email Test'));
  
  // Check if API key is configured
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(chalk.red('Email service is not configured correctly'));
    console.log(chalk.gray('Please run the setup script: npm run setup-email'));
    return;
  }
  
  const resend = new Resend(apiKey);
  console.log(chalk.gray('Verifying email configuration...'));
  
  // Get test email address
  const { email } = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: 'Send test email to:',
      validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email'
    }
  ]);
  
  console.log(chalk.gray(`Sending test email to ${email}...`));
  
  try {
    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    
    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Project Mosaic - Email Test',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Project Mosaic</h1>
          <p>This is a test email from Project Mosaic.</p>
          <p>If you're receiving this, your email configuration is working correctly!</p>
          <div style="margin-top: 24px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="margin: 0; color: #4b5563;">From: ${fromEmail}</p>
            <p style="margin: 8px 0 0; color: #4b5563;">Sent: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    });
    
    if (result.error) {
      console.log(chalk.red('Failed to send test email'));
      console.log(chalk.gray(result.error.message));
    } else {
      console.log(chalk.green('✓ Test email sent successfully!'));
      console.log(chalk.gray(`Message ID: ${result.data.id}`));
    }
  } catch (error: any) {
    console.log(chalk.red('Error sending test email:'));
    console.log(chalk.gray(error?.message || 'Unknown error occurred'));
  }
}

testEmail().catch(console.error);
