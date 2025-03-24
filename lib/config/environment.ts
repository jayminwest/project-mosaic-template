export function validateEnvironment(): void {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ];

  const optionalVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY',
    'EMAIL_FROM',
  ];

  const missingRequired = requiredVars.filter(
    varName => !process.env[varName]
  );

  if (missingRequired.length > 0) {
    console.warn(`Missing required environment variables: ${missingRequired.join(', ')}`);
    console.warn('Some features may not work correctly.');
  }

  const missingOptional = optionalVars.filter(
    varName => !process.env[varName]
  );

  if (missingOptional.length > 0) {
    console.info(`Missing optional environment variables: ${missingOptional.join(', ')}`);
    console.info('Some features may be disabled.');
  }
}
