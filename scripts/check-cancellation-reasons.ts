#!/usr/bin/env ts-node
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(chalk.red('Missing Supabase credentials. Please check your .env.local file.'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCancellationReasons() {
  console.log(chalk.blue('Checking Cancellation Reasons Table'));
  
  try {
    // Check if the table exists
    console.log(chalk.yellow('\nChecking if cancellation_reasons table exists...'));
    const { count, error: countError } = await supabase
      .from('cancellation_reasons')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log(chalk.red(`Error checking table: ${countError.message}`));
      return;
    }
    
    console.log(chalk.green(`✓ Table exists with ${count} records`));
    
    // Get all records from the table
    console.log(chalk.yellow('\nFetching all records from cancellation_reasons...'));
    const { data, error } = await supabase
      .from('cancellation_reasons')
      .select('*');
    
    if (error) {
      console.log(chalk.red(`Error fetching records: ${error.message}`));
      return;
    }
    
    if (!data || data.length === 0) {
      console.log(chalk.yellow('No records found in the cancellation_reasons table.'));
    } else {
      console.log(chalk.green(`Found ${data.length} records:`));
      data.forEach((record, index) => {
        console.log(chalk.blue(`\nRecord ${index + 1}:`));
        console.log(chalk.gray(`ID: ${record.id}`));
        console.log(chalk.gray(`User ID: ${record.user_id}`));
        console.log(chalk.gray(`Reason: ${record.reason}`));
        console.log(chalk.gray(`Subscription ID: ${record.subscription_id}`));
        console.log(chalk.gray(`Created At: ${record.created_at}`));
      });
    }
    
    // Try to insert a test record
    console.log(chalk.yellow('\nInserting a test record...'));
    
    // Get a user ID from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (profilesError) {
      console.log(chalk.red(`Error getting user ID: ${profilesError.message}`));
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log(chalk.red('No user profiles found to use for testing.'));
      return;
    }
    
    const testUserId = profiles[0].user_id;
    
    // Insert a test record
    const { data: insertResult, error: insertError } = await supabase
      .from('cancellation_reasons')
      .insert({
        user_id: testUserId,
        reason: 'Test record from check-cancellation-reasons script',
        subscription_id: 'test-script-id',
        created_at: new Date().toISOString()
      })
      .select();
    
    if (insertError) {
      console.log(chalk.red(`Error inserting test record: ${insertError.message}`));
    } else {
      console.log(chalk.green('✓ Successfully inserted test record:'));
      console.log(chalk.gray(JSON.stringify(insertResult, null, 2)));
      
      // Fetch the record again to verify it was inserted
      console.log(chalk.yellow('\nVerifying the inserted record...'));
      const { data: verifyData, error: verifyError } = await supabase
        .from('cancellation_reasons')
        .select('*')
        .eq('reason', 'Test record from check-cancellation-reasons script');
      
      if (verifyError) {
        console.log(chalk.red(`Error verifying record: ${verifyError.message}`));
      } else if (!verifyData || verifyData.length === 0) {
        console.log(chalk.red('✗ Could not verify the inserted record.'));
      } else {
        console.log(chalk.green(`✓ Verified record exists in database:`));
        console.log(chalk.gray(JSON.stringify(verifyData, null, 2)));
      }
      
      // Clean up the test record
      console.log(chalk.yellow('\nCleaning up test record...'));
      const { error: deleteError } = await supabase
        .from('cancellation_reasons')
        .delete()
        .eq('reason', 'Test record from check-cancellation-reasons script');
      
      if (deleteError) {
        console.log(chalk.red(`Error deleting test record: ${deleteError.message}`));
      } else {
        console.log(chalk.green('✓ Successfully deleted test record'));
      }
    }
    
  } catch (error) {
    console.error(chalk.red('Unexpected error:'), error);
  }
  
  console.log(chalk.blue('\nCheck complete!'));
}

checkCancellationReasons().catch(error => {
  console.error(chalk.red('Error:'), error);
  process.exit(1);
});
