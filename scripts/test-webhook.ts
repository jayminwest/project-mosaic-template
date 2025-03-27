#!/usr/bin/env ts-node
import chalk from 'chalk';
import { config } from 'dotenv';
import Stripe from 'stripe';
import inquirer from 'inquirer';
import fetch from 'node-fetch';

// Load environment variables
config({ path: '.env.local' });

// Check if Stripe API key is available
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

if (!STRIPE_SECRET_KEY) {
  console.error(chalk.red('Stripe API key is not configured'));
  console.error(chalk.gray('Please add STRIPE_SECRET_KEY to your .env.local file'));
  process.exit(1);
}

if (!SUPABASE_URL) {
  console.error(chalk.red('Supabase URL is not configured'));
  console.error(chalk.gray('Please add NEXT_PUBLIC_SUPABASE_URL to your .env.local file'));
  process.exit(1);
}

// Initialize Stripe client
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function testWebhook() {
  console.log(chalk.blue('Project Mosaic - Stripe Webhook Test'));
  console.log(chalk.gray('This tool will help you test your Stripe webhook configuration'));
  
  // Check if webhook endpoint is configured
  const webhookUrl = `${SUPABASE_URL}/functions/v1/stripe-webhook`;
  console.log(chalk.gray(`Testing webhook endpoint: ${webhookUrl}`));
  
  try {
    // Test a simple OPTIONS request first (CORS preflight)
    console.log(chalk.gray('Testing CORS preflight...'));
    const optionsResponse = await fetch(webhookUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Stripe-Signature'
      }
    });
    
    console.log(chalk.green(`✓ CORS preflight response: ${optionsResponse.status}`));
    
    // Test a POST request with an empty body
    console.log(chalk.gray('Testing POST request without signature...'));
    const postResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    const postData = await postResponse.json();
    console.log(chalk.yellow(`POST response: ${postResponse.status}`));
    console.log(chalk.gray(`Response body: ${JSON.stringify(postData)}`));
    
    // Any response is acceptable as long as it's not a 401 Unauthorized
    if (postResponse.status !== 401) {
      console.log(chalk.green('✓ Webhook endpoint is accessible without authorization headers'));
      console.log(chalk.gray(`Response: ${postResponse.status} - ${JSON.stringify(postData)}`));
    } else {
      console.log(chalk.red(`✗ Webhook still requires authorization headers: ${postResponse.status} - ${JSON.stringify(postData)}`));
    }
    
    // Ask if user wants to trigger a real webhook event
    const { triggerEvent } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'triggerEvent',
        message: 'Would you like to trigger a real webhook event using the Stripe CLI?',
        default: true
      }
    ]);
    
    if (triggerEvent) {
      console.log(chalk.blue('\nTo trigger a real webhook event, run this command in your terminal:'));
      console.log(chalk.gray('stripe trigger customer.subscription.updated'));
      console.log(chalk.blue('\nMake sure you have the Stripe CLI installed and configured.'));
      console.log(chalk.blue('You can install it from: https://stripe.com/docs/stripe-cli'));
      
      console.log(chalk.yellow('\nAfter running the command, check your Supabase logs for the webhook event.'));
      console.log(chalk.gray('You can view logs in the Supabase dashboard under "Edge Functions" > "stripe-webhook"'));
    }
    
    console.log(chalk.blue('\nWebhook testing complete!'));
    
  } catch (error) {
    console.error(chalk.red('Error testing webhook:'), error.message);
  }
}

// Run the test
testWebhook().catch(error => {
  console.error(chalk.red('Error during webhook testing:'), error);
  process.exit(1);
});
