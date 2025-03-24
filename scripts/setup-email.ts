import { Resend } from 'resend';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

async function setupEmail() {
  console.log(chalk.blue('Project Mosaic - Email Setup'));
  console.log(chalk.gray('This tool will help you configure email for your micro-SaaS project'));
  
  // Get API key
  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Resend API Key:',
      validate: (input) => input.length > 0 || 'API Key is required'
    }
  ]);
  
  // Test the API key
  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.domains.list();
    
    if (error) {
      console.log(chalk.red('Error: Invalid API key or API request failed'));
      console.log(chalk.gray(error.message));
      return;
    }
    
    console.log(chalk.green('✓ API key is valid'));
    
    // Get domain information
    const { setupDomain, domain, fromEmail } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'setupDomain',
        message: 'Would you like to set up a custom domain?',
        default: true
      },
      {
        type: 'input',
        name: 'domain',
        message: 'Domain name (e.g., yourdomain.com):',
        when: (answers) => answers.setupDomain,
        validate: (input) => input.length > 0 || 'Domain is required'
      },
      {
        type: 'input',
        name: 'fromEmail',
        message: 'From email address:',
        default: (answers) => answers.setupDomain ? `noreply@${answers.domain}` : 'noreply@resend.dev',
        validate: (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input) || 'Please enter a valid email'
      }
    ]);
    
    // Set up domain if requested
    if (setupDomain && domain) {
      console.log(chalk.gray(`Setting up domain: ${domain}`));
      
      const { data: domainData, error: domainError } = await resend.domains.create({
        name: domain
      });
      
      if (domainError) {
        console.log(chalk.yellow(`Warning: Could not set up domain automatically: ${domainError.message}`));
        console.log(chalk.gray('You can set up the domain manually in the Resend dashboard'));
      } else {
        console.log(chalk.green('✓ Domain created successfully'));
        console.log(chalk.blue('DNS Records to add:'));
        
        // Display DNS records (this is a simplified example)
        console.log(chalk.gray('Please add the following DNS records to your domain:'));
        console.log(chalk.gray('1. TXT record: _resend with value provided in the Resend dashboard'));
        console.log(chalk.gray('2. MX record: mx.resend.com with priority 10'));
        console.log(chalk.gray('3. DKIM record: as provided in the Resend dashboard'));
        
        console.log(chalk.yellow('\nImportant: It may take up to 24 hours for DNS changes to propagate'));
        console.log(chalk.yellow('Check the Resend dashboard for verification status'));
      }
    }
    
    // Update .env file
    console.log(chalk.gray('\nUpdating environment variables...'));
    const envPath = path.join(process.cwd(), '.env');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    let envContent = '';
    let targetEnvPath = '';
    
    // Determine which env file to update
    if (fs.existsSync(envLocalPath)) {
      envContent = fs.readFileSync(envLocalPath, 'utf8');
      targetEnvPath = envLocalPath;
    } else if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      targetEnvPath = envPath;
    } else if (fs.existsSync(envExamplePath)) {
      envContent = fs.readFileSync(envExamplePath, 'utf8');
      targetEnvPath = envPath;
    } else {
      targetEnvPath = envPath;
    }
    
    // Update or add email variables
    const envVars = {
      RESEND_API_KEY: apiKey,
      EMAIL_FROM: fromEmail
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    });
    
    fs.writeFileSync(targetEnvPath, envContent);
    console.log(chalk.green(`Environment variables updated in ${targetEnvPath}`));
    
    console.log(chalk.green('\nEmail setup complete!'));
    console.log(chalk.blue('Next steps:'));
    console.log(chalk.gray('1. Restart your development server'));
    console.log(chalk.gray('2. Test email functionality with the test command:'));
    console.log(chalk.gray('   npm run test-email'));
    
  } catch (error: any) {
    console.log(chalk.red('Error setting up email:'));
    console.log(chalk.gray(error?.message || 'Unknown error occurred'));
  }
}

setupEmail().catch(console.error);
