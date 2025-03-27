import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { isInGracePeriod, getRemainingGraceDays, getGracePeriodEndDate } from '../lib/config/plan-access.ts';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(chalk.red('Missing Supabase credentials. Please check your .env.local file.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCancellationFlow() {
  console.log(chalk.blue('Testing Subscription Cancellation Flow'));
  console.log(chalk.gray('This script verifies the cancellation flow components'));
  
  // Test 1: Check if cancellation_reasons table exists
  console.log(chalk.yellow('\nTest 1: Checking if cancellation_reasons table exists'));
  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'cancellation_reasons');
    
    if (error) throw error;
    
    if (tables && tables.length > 0) {
      console.log(chalk.green('✓ cancellation_reasons table exists'));
    } else {
      console.log(chalk.red('✗ cancellation_reasons table does not exist'));
      console.log(chalk.gray('Please run the migration to create the table'));
    }
  } catch (error) {
    console.error(chalk.red('Error checking cancellation_reasons table:'), error);
  }
  
  // Test 2: Check if grace period functions work correctly
  console.log(chalk.yellow('\nTest 2: Testing grace period functions'));
  
  // Test with a cancellation date 15 days ago (should be in grace period)
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
  
  // Test with a cancellation date 45 days ago (should be outside grace period)
  const fortyFiveDaysAgo = new Date();
  fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);
  
  console.log(chalk.gray('Testing with cancellation date 15 days ago:'));
  console.log(`isInGracePeriod: ${isInGracePeriod(fifteenDaysAgo.toISOString())}`);
  console.log(`getRemainingGraceDays: ${getRemainingGraceDays(fifteenDaysAgo.toISOString())}`);
  console.log(`getGracePeriodEndDate: ${getGracePeriodEndDate(fifteenDaysAgo.toISOString())}`);
  
  console.log(chalk.gray('\nTesting with cancellation date 45 days ago:'));
  console.log(`isInGracePeriod: ${isInGracePeriod(fortyFiveDaysAgo.toISOString())}`);
  console.log(`getRemainingGraceDays: ${getRemainingGraceDays(fortyFiveDaysAgo.toISOString())}`);
  console.log(`getGracePeriodEndDate: ${getGracePeriodEndDate(fortyFiveDaysAgo.toISOString())}`);
  
  if (isInGracePeriod(fifteenDaysAgo.toISOString()) && !isInGracePeriod(fortyFiveDaysAgo.toISOString())) {
    console.log(chalk.green('✓ Grace period functions work correctly'));
  } else {
    console.log(chalk.red('✗ Grace period functions are not working as expected'));
  }
  
  // Test 3: Check if we can insert a cancellation reason
  console.log(chalk.yellow('\nTest 3: Testing cancellation reason storage'));
  
  // Create a test user if needed
  let testUserId: string | null = null;
  
  try {
    // Check if test user exists
    const { data: existingUsers, error: userError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', 'test-cancellation@example.com')
      .limit(1);
    
    if (userError) throw userError;
    
    if (existingUsers && existingUsers.length > 0) {
      testUserId = existingUsers[0].user_id;
      console.log(chalk.gray(`Using existing test user: ${testUserId}`));
    } else {
      // Create a test user
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'test-cancellation@example.com',
        password: 'test-password',
        email_confirm: true
      });
      
      if (createError) throw createError;
      
      testUserId = authUser.user.id;
      console.log(chalk.gray(`Created new test user: ${testUserId}`));
    }
    
    // Insert a test cancellation reason
    const { data: insertResult, error: insertError } = await supabase
      .from('cancellation_reasons')
      .insert({
        user_id: testUserId,
        reason: 'Testing cancellation flow',
        subscription_id: 'test-subscription-id',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) throw insertError;
    
    console.log(chalk.green('✓ Successfully inserted cancellation reason'));
    
    // Clean up the test data
    const { error: deleteError } = await supabase
      .from('cancellation_reasons')
      .delete()
      .eq('user_id', testUserId)
      .eq('reason', 'Testing cancellation flow');
    
    if (deleteError) throw deleteError;
    
    console.log(chalk.gray('Cleaned up test data'));
    
  } catch (error) {
    console.error(chalk.red('Error testing cancellation reason storage:'), error);
  }
  
  console.log(chalk.blue('\nCancellation flow testing complete!'));
}

testCancellationFlow();
