#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prompt } from 'inquirer';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupAIKeys() {
  console.log(chalk.blue('🧠 Project Mosaic - AI Keys Setup'));
  console.log(chalk.gray('This tool will help you configure AI provider API keys for your project'));
  
  // Check if API keys are already in .env.local
  const envLocalPath = path.join(process.cwd(), '.env.local');
  let envFileExists = fs.existsSync(envLocalPath);
  let envContent = envFileExists ? fs.readFileSync(envLocalPath, 'utf8') : '';
  
  // Extract existing keys
  const openAIKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
  const anthropicKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY || '';
  
  console.log('\nCurrent Configuration:');
  console.log(chalk.gray('OpenAI API Key: ') + (openAIKey ? chalk.green('Configured') : chalk.yellow('Not configured')));
  console.log(chalk.gray('Anthropic API Key: ') + (anthropicKey ? chalk.green('Configured') : chalk.yellow('Not configured')));
  
  // Ask which provider to configure
  const { provider } = await prompt({
    type: 'list',
    name: 'provider',
    message: 'Which AI provider would you like to configure?',
    choices: [
      { name: 'OpenAI (GPT-4, GPT-3.5)', value: 'openai' },
      { name: 'Anthropic (Claude)', value: 'anthropic' },
      { name: 'Both providers', value: 'both' },
      { name: 'Exit without changes', value: 'exit' }
    ]
  });
  
  if (provider === 'exit') {
    console.log(chalk.blue('Exiting without changes'));
    return;
  }
  
  // Configure OpenAI
  let newOpenAIKey = openAIKey;
  if (provider === 'openai' || provider === 'both') {
    const { configureOpenAI } = await prompt({
      type: 'confirm',
      name: 'configureOpenAI',
      message: 'Do you want to configure OpenAI API key?',
      default: true
    });
    
    if (configureOpenAI) {
      const { apiKey } = await prompt({
        type: 'input',
        name: 'apiKey',
        message: 'Enter your OpenAI API key (starts with sk-):',
        validate: (input) => {
          if (!input.trim()) return 'API key cannot be empty';
          if (!input.startsWith('sk-')) return 'OpenAI API keys typically start with "sk-"';
          return true;
        }
      });
      
      newOpenAIKey = apiKey.trim();
      console.log(chalk.green('✓ OpenAI API key saved'));
    }
  }
  
  // Configure Anthropic
  let newAnthropicKey = anthropicKey;
  if (provider === 'anthropic' || provider === 'both') {
    const { configureAnthropic } = await prompt({
      type: 'confirm',
      name: 'configureAnthropic',
      message: 'Do you want to configure Anthropic API key?',
      default: true
    });
    
    if (configureAnthropic) {
      const { apiKey } = await prompt({
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Anthropic API key (starts with sk-ant-):',
        validate: (input) => {
          if (!input.trim()) return 'API key cannot be empty';
          if (!input.startsWith('sk-ant-')) return 'Anthropic API keys typically start with "sk-ant-"';
          return true;
        }
      });
      
      newAnthropicKey = apiKey.trim();
      console.log(chalk.green('✓ Anthropic API key saved'));
    }
  }
  
  // Set default provider
  const { defaultProvider } = await prompt({
    type: 'list',
    name: 'defaultProvider',
    message: 'Which provider would you like to set as default?',
    choices: [
      { name: 'OpenAI', value: 'openai' },
      { name: 'Anthropic', value: 'anthropic' },
      { name: 'Local (fallback only)', value: 'local' }
    ],
    default: process.env.NEXT_PUBLIC_AI_PROVIDER || 'openai'
  });
  
  // Update .env.local file
  if (!envFileExists) {
    envContent = '# Project Mosaic Environment Variables\n\n';
  }
  
  // Helper to update or add env var
  const updateEnvVar = (content, key, value) => {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (regex.test(content)) {
      return content.replace(regex, `${key}=${value}`);
    } else {
      return `${content}\n${key}=${value}`;
    }
  };
  
  // Update environment variables
  if (newOpenAIKey) {
    envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_OPENAI_API_KEY', newOpenAIKey);
    envContent = updateEnvVar(envContent, 'OPENAI_API_KEY', newOpenAIKey);
  }
  
  if (newAnthropicKey) {
    envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_ANTHROPIC_API_KEY', newAnthropicKey);
    envContent = updateEnvVar(envContent, 'ANTHROPIC_API_KEY', newAnthropicKey);
  }
  
  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_AI_PROVIDER', defaultProvider);
  
  // Set default model based on provider
  let defaultModel = '';
  if (defaultProvider === 'openai') {
    defaultModel = 'gpt-4o';
  } else if (defaultProvider === 'anthropic') {
    defaultModel = 'claude-3-haiku-latest';
  } else {
    defaultModel = 'local-fallback';
  }
  
  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_AI_MODEL', defaultModel);
  
  // Write updated content to .env.local
  fs.writeFileSync(envLocalPath, envContent);
  
  console.log(chalk.green('\n✓ AI configuration updated successfully!'));
  console.log(chalk.blue('\nConfiguration Summary:'));
  console.log(`Default Provider: ${chalk.cyan(defaultProvider)}`);
  console.log(`Default Model: ${chalk.cyan(defaultModel)}`);
  console.log(`OpenAI API Key: ${newOpenAIKey ? chalk.green('Configured') : chalk.yellow('Not configured')}`);
  console.log(`Anthropic API Key: ${newAnthropicKey ? chalk.green('Configured') : chalk.yellow('Not configured')}`);
  
  console.log(chalk.blue('\nNext Steps:'));
  console.log('1. Restart your development server to apply changes');
  console.log('2. Test your AI configuration with the AI Assistant in the dashboard');
  console.log('3. If using Supabase Edge Functions, also set these keys in your Supabase project');
  
  console.log(chalk.gray('\nTo set keys in Supabase:'));
  console.log('supabase secrets set OPENAI_API_KEY=your_key_here');
  console.log('supabase secrets set ANTHROPIC_API_KEY=your_key_here');
  
  // Ask if user wants to set keys in Supabase now
  const { setInSupabase } = await prompt({
    type: 'confirm',
    name: 'setInSupabase',
    message: 'Would you like to set these keys in Supabase now?',
    default: false
  });
  
  if (setInSupabase) {
    console.log(chalk.blue('\nSetting keys in Supabase...'));
    console.log(chalk.gray('You will need to have the Supabase CLI installed and be logged in.'));
    
    if (newOpenAIKey) {
      console.log(chalk.gray(`Running: supabase secrets set OPENAI_API_KEY=********`));
      console.log(chalk.yellow('Please run this command manually for security:'));
      console.log(`supabase secrets set OPENAI_API_KEY=${newOpenAIKey}`);
    }
    
    if (newAnthropicKey) {
      console.log(chalk.gray(`Running: supabase secrets set ANTHROPIC_API_KEY=********`));
      console.log(chalk.yellow('Please run this command manually for security:'));
      console.log(`supabase secrets set ANTHROPIC_API_KEY=${newAnthropicKey}`);
    }
  }
}

setupAIKeys().catch(console.error);
