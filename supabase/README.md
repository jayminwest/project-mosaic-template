# Supabase Database Management

This directory contains the database schema and migrations for the Supabase backend.

## Local Development

To reset your local database to match the migrations:

```bash
npx supabase db reset

To push your local schema changes to your remote Supabase project:
```bash
npx supabase db push
```
```

## Pushing Changes to Remote

After making changes to your local database schema, you can push those changes to your remote Supabase project:

```bash
npx supabase db push
```

If you need more detailed information about what's happening during the push, add the `--debug` flag:

```bash
npx supabase db push --debug
```

## Common Issues

If you encounter errors when pushing to remote:

1. Make sure your Supabase CLI is properly installed and updated:
   ```bash
   npm install -g supabase
   ```

2. Verify your Supabase credentials are correctly set up:
   ```bash
   supabase login
   ```

3. Check that your project is properly linked:
   ```bash
   supabase link --project-ref your-project-ref
   ```

## Database Schema

The main schema is defined in `migrations/0_init_core_schema.sql`, which includes:

- User profiles table
- Storage bucket configuration
- Usage tracking
- Stripe integration
- Row-level security policies

When making changes to the schema, always update the migration files rather than making direct changes to the remote database.
