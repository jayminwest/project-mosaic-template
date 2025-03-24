import { describe, expect, test } from '@jest/globals';

/**
 * Core functionality tests
 * 
 * These tests verify the basic functionality of the template
 * before testing specific features like auth, storage, etc.
 */
describe('Suite 1: Core Functionality', () => {
  test('Environment is properly configured', () => {
    // Check that required environment variables are set
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  test('Basic test infrastructure is working', () => {
    // Simple test to verify Jest is working
    expect(1 + 1).toBe(2);
  });
});
