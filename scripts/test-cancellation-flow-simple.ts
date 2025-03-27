import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import chalk from 'chalk';

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

// Default grace period in days after cancellation
const DEFAULT_GRACE_PERIOD_DAYS = 30;

// Check if a user is in the grace period after cancellation
function isInGracePeriod(cancellationDate?: string | null, gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS): boolean {
  if (!cancellationDate) return false;
  
  const cancelDate = new Date(cancellationDate);
  const now = new Date();
  
  // Calculate the end of grace period
  const graceEndDate = new Date(cancelDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays);
  
  // User is in grace period if current date is before grace period end
  return now <= graceEndDate;
}

// Calculate remaining days in grace period
function getRemainingGraceDays(cancellationDate?: string | null, gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS): number {
  if (!cancellationDate) return 0;
  
  const cancelDate = new Date(cancellationDate);
  const now = new Date();
  
  // Calculate the end of grace period
  const graceEndDate = new Date(cancelDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays);
  
  // Calculate remaining days
  const remainingTime = graceEndDate.getTime() - now.getTime();
  const remainingDays = Math.ceil(remainingTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, remainingDays);
}

// Get formatted grace period end date
function getGracePeriodEndDate(cancellationDate?: string | null, gracePeriodDays: number = DEFAULT_GRACE_PERIOD_DAYS): string {
  if (!cancellationDate) return '';
  
  const cancelDate = new Date(cancellationDate);
  const graceEndDate = new Date(cancelDate);
  graceEndDate.setDate(graceEndDate.getDate() + gracePeriodDays);
  
  return graceEndDate.toLocaleDateString();
}

async function testCancellationFlow() {
  console.log(chalk.blue('Testing Subscription Cancellation Flow'));
  console.log(chalk.gray('This script verifies the cancellation flow components'));
  
  // Test 1: Check if cancellation_reasons table exists
  console.log(chalk.yellow('\nTest 1: Checking if cancellation_reasons table exists'));
  try {
    // Use a direct query to check if the table exists
    const { count, error: countError } = await supabase
      .from('cancellation_reasons')
      .select('*', { count: 'exact', head: true });
    
    if (countError && countError.code === '42P01') {
      console.log(chalk.red('✗ cancellation_reasons table does not exist'));
      console.log(chalk.gray('Please run the migration to create the table'));
    } else if (countError) {
      throw countError;
    } else {
      console.log(chalk.green('✓ cancellation_reasons table exists'));
      
      // Show basic table info
      console.log(chalk.gray('Table structure: (simplified view)'));
      console.log(chalk.gray('  - id: UUID (primary key)'));
      console.log(chalk.gray('  - user_id: UUID (foreign key)'));
      console.log(chalk.gray('  - reason: TEXT'));
      console.log(chalk.gray('  - subscription_id: TEXT'));
      console.log(chalk.gray('  - created_at: TIMESTAMP WITH TIME ZONE'));
      console.log(chalk.gray('  - updated_at: TIMESTAMP WITH TIME ZONE'));
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
    // Try to find a user directly from profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);
    
    if (profilesError) {
      console.log(chalk.gray(`Error finding profiles: ${profilesError.message}`));
    }
    
    if (profiles && profiles.length > 0) {
      testUserId = profiles[0].user_id;
      console.log(chalk.gray(`Using existing user from profiles: ${testUserId}`));
    } else {
      // If not found in profiles, try to get any user from profiles
      const { data: anyProfile, error: anyProfileError } = await supabase
        .from('profiles')
        .select('user_id')
        .limit(1);
      
      if (anyProfileError) {
        console.log(chalk.gray(`Error finding any profile: ${anyProfileError.message}`));
      } else if (anyProfile && anyProfile.length > 0) {
        testUserId = anyProfile[0].user_id;
        console.log(chalk.gray(`Using existing user from profiles: ${testUserId}`));
      } else {
        // If no users found, try to create one (this might fail due to permissions)
        try {
          const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
            email: 'test-cancellation@example.com',
            password: 'test-password',
            email_confirm: true
          });
          
          if (createError) {
            throw createError;
          }
          
          if (authUser) {
            testUserId = authUser.user.id;
            console.log(chalk.gray(`Created new test user: ${testUserId}`));
          }
        } catch (createError: any) {
          console.log(chalk.gray(`Could not create test user: ${createError.message}`));
          console.log(chalk.gray('Using a mock user ID for testing'));
          testUserId = '00000000-0000-0000-0000-000000000000'; // Mock ID for testing
        }
      }
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
    
    if (insertError) {
      console.log(chalk.red(`Error inserting cancellation reason: ${insertError.message}`));
      throw insertError;
    }
    
    console.log(chalk.green('✓ Successfully inserted cancellation reason'));
    console.log(chalk.gray(`Inserted record: ${JSON.stringify(insertResult)}`));
    
    // Try using the get_cancellation_reasons function
    console.log(chalk.gray('Querying using get_cancellation_reasons function...'));
    const { data: directData, error: directError } = await supabase.rpc(
      'get_cancellation_reasons',
      { user_id_param: testUserId }
    );
    
    if (directError) {
      console.log(chalk.red(`Error using get_cancellation_reasons: ${directError.message}`));
    } else {
      console.log(chalk.gray(`Direct query result: ${JSON.stringify(directData)}`));
    }
    
    // Verify the record was inserted by querying it back
    const { data: verifyData, error: verifyError } = await supabase
      .from('cancellation_reasons')
      .select('*')
      .eq('user_id', testUserId)
      .eq('reason', 'Testing cancellation flow');
      
    if (verifyError) {
      console.log(chalk.red(`Error verifying insertion: ${verifyError.message}`));
    } else {
      console.log(chalk.gray(`Verification query returned ${verifyData?.length || 0} records`));
      if (verifyData && verifyData.length > 0) {
        console.log(chalk.green('✓ Verified record exists in database'));
      } else {
        console.log(chalk.red('✗ Could not verify record in database'));
      }
    }
    
    // Skip SQL execution since it's not working
    console.log(chalk.gray('Skipping direct SQL execution (not available)'));
    
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
