# Tutorial 2: Authentication and User Management

This tutorial implements authentication and user management for your Project Mosaic product. We'll set up both social and email authentication, configure security policies, and implement the necessary client-side hooks.

## Authentication Objectives

- **Social Login**: Implement Google OAuth for frictionless onboarding
- **Email/Password**: Provide traditional authentication as an alternative
- **Security Policies**: Ensure users can only access their own data
- **Profile Management**: Automatically create and manage user profiles
- **Route Protection**: Redirect unauthenticated users to login

## Configure Supabase Authentication

### Email Authentication Setup

1. Go to your Supabase Dashboard → Authentication → Providers
2. Under the "Email" tab:
   - Ensure it's enabled
   - For development, you can disable "Confirm email" (enable in production)
   - Save changes

### Google Authentication Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to API and Services → Credentials
4. Create OAuth credentials:
   - Application type: Web application
   - Add authorized redirect URI: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
   - Add your production domain if available
5. Copy the Client ID and Client Secret
6. In Supabase Dashboard → Authentication → Providers:
   - Click the "Google" tab
   - Enable the provider
   - Paste your Client ID and Client Secret
   - Save changes

## Apply Authentication Migrations

The template includes a migration file `supabase/migrations/2_init_auth.sql` that sets up:

- Automatic profile creation when users sign up
- Row-level security policies for user data
- Indexes for optimized queries

Apply the migration:

```sh
supabase db push
```

Verify it worked by creating a test user in the Supabase dashboard (Authentication → Users → Add User) and checking that a profile was automatically created in the Profiles table.

## Customize Authentication for Your Product

The template includes a complete `useAuth` hook in `hooks/useAuth.ts`. Review this implementation to understand how it:

1. Manages authentication state
2. Handles login, signup, and logout
3. Fetches user profile data
4. Integrates with the route guard

You may need to customize this hook based on your product's specific requirements:

```typescript
// Example customization: Add additional profile fields
const fetchUserProfile = async (userId: string, userEmail: string) => {
  try {
    // Get profile data
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*, product_specific_settings(*)")  // Add your product-specific joins
      .eq("user_id", userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Combine with user email
    setUser({
      ...profileData,
      email: userEmail,
      // Add any product-specific transformations
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    setError(error.message);
  }
};
```

## Implement Product-Specific Security Policies

For your product-specific tables, add appropriate security policies:

```sql
-- Example for a content calendar product
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Users can only read their own content
CREATE POLICY "Users can read their own content" 
  ON public.content_items FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own content
CREATE POLICY "Users can insert their own content" 
  ON public.content_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Similar policies for UPDATE and DELETE
```

## Customize the Route Guard

The template includes a `RouteGuard` component that protects authenticated routes. Review `components/RouteGuard.tsx` to understand how it:

1. Checks authentication status
2. Redirects unauthenticated users to login
3. Redirects authenticated users away from public routes

You may need to customize the public routes array for your product:

```typescript
// Add your product-specific public routes
const PUBLIC_ROUTES = [
  "/",
  "/pricing",
  "/features",
  "/about",
  // Add any other public routes
];

// Update the default authenticated route if needed
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";
```

## Testing Authentication

Run the authentication tests to verify your setup:

```sh
npm test tests/integration/2_auth.test.ts
```

Make sure your `.env.test.local` file includes the Supabase service role key:

```
SUPABASE_SERVICE_KEY="your-service-role-key"
```

You can find this key in your Supabase dashboard under Project Settings → API → API Keys → `service_role` key.

## Next Steps

With authentication in place, you can now:

1. Create product-specific pages that require authentication
2. Implement user profile settings specific to your product
3. Add role-based access control if your product requires it
4. Customize the login and signup experience with your branding

In the next tutorial, we'll implement file storage for your product.
