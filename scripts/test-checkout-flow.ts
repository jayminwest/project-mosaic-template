#!/usr/bin/env ts-node
import chalk from 'chalk';
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import path from 'path';

// Load environment variables
config({ path: path.join(process.cwd(), '.env.local') });

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCheckoutFlow() {
  console.log(chalk.blue('Project Mosaic - Test Checkout Flow'));
  console.log(chalk.gray('This tool will test your checkout flow with trial periods'));
  
  // Check if required environment variables are set
  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log(chalk.red('Missing required environment variables'));
    console.log(chalk.gray('Please ensure STRIPE_SECRET_KEY, NEXT_PUBLIC_SUPABASE_URL, and NEXT_PUBLIC_SUPABASE_ANON_KEY are set'));
    return;
  }
  
  try {
    // 1. Check if Stripe products are configured with trial periods
    console.log(chalk.blue('\n1. Checking Stripe products configuration...'));
    
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
    });
    
    if (products.data.length === 0) {
      console.log(chalk.red('No active products found in your Stripe account'));
      console.log(chalk.gray('Please run npm run setup-subscription-plans to create products'));
      return;
    }
    
    console.log(chalk.green(`Found ${products.data.length} active products`));
    
    for (const product of products.data) {
      const price = product.default_price as Stripe.Price;
      const trialDays = product.metadata?.trial_period_days;
      
      console.log(chalk.white(`\nProduct: ${product.name}`));
      console.log(chalk.gray(`ID: ${product.id}`));
      console.log(chalk.gray(`Price ID: ${price?.id || 'No default price'}`));
      console.log(chalk.gray(`Plan Type: ${product.metadata?.plan_type || 'Not set'}`));
      
      if (trialDays) {
        console.log(chalk.green(`Trial Period: ${trialDays} days`));
      } else {
        console.log(chalk.yellow('Trial Period: Not configured'));
      }
    }
    
    // 2. Test Edge Functions
    console.log(chalk.blue('\n2. Testing Edge Functions...'));
    
    // Test list-subscription-plans
    console.log(chalk.gray('\nTesting list-subscription-plans function...'));
    const { data: plansData, error: plansError } = await supabase.functions.invoke('list-subscription-plans');
    
    if (plansError) {
      console.log(chalk.red(`Error: ${plansError.message}`));
    } else {
      console.log(chalk.green(`Success! Found ${plansData.plans.length} subscription plans`));
    }
    
    // 3. Provide checkout test instructions
    console.log(chalk.blue('\n3. Testing Checkout Flow'));
    console.log(chalk.gray('To test the complete checkout flow:'));
    console.log(chalk.white('1. Sign up for an account or log in'));
    console.log(chalk.white('2. Visit the pricing page'));
    console.log(chalk.white('3. Click on a subscription plan'));
    console.log(chalk.white('4. Complete the checkout process with test card details:'));
    console.log(chalk.gray('   - Card number: 4242 4242 4242 4242'));
    console.log(chalk.gray('   - Expiry: Any future date'));
    console.log(chalk.gray('   - CVC: Any 3 digits'));
    
  } catch (error) {
    console.error(chalk.red('Error testing checkout flow:'), error);
  }
}

testCheckoutFlow().catch(console.error);
