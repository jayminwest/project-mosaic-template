# Tutorial 1: Setting Up Your Product Database

This tutorial guides you through setting up the database for your Project Mosaic product. We'll create a Supabase project and implement the core data model that will store your product's information.

## Create Supabase Project

First, create a new Supabase project for your micro-SaaS:

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project"
3. Set a secure database password
4. Choose a region close to your target audience
5. Select the free tier for development (you can upgrade later)

Once created, get your API credentials from Project Settings → API:
- Project URL: `https://[project-id].supabase.co`
- Project Reference ID: `[project-id]` (looks like 'abcdefghijklm')
- `anon` `public` Key: starts with `eyJhbGciOiJIUzI1NiIs...`

Create environment files for local development and testing:
```sh
# Create .env.local and .env.test.local files
cp .env.example .env.local
cp .env.example .env.test.local
```

Update both files with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL="https://[your-project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
```

## Set Up Supabase CLI

Install and configure the Supabase CLI:

```bash
# Install Supabase CLI
npm install supabase --save-dev

# Initialize Supabase in your project
supabase init

# Link to your remote project (replace with your project reference)
supabase link --project-ref [your-project-ref]
```

## Create Your Product Schema

Now, create the database schema for your specific product. The template already includes migrations for common tables like profiles and authentication, but you'll need to add your product-specific tables.

Create a new migration file in `supabase/migrations/` with a name like `10_init_[your-product].sql`:

```sql
-- Example schema for a content calendar product
CREATE TABLE public.content_items (
  item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;

-- Users can read their own content
CREATE POLICY "Users can read their own content" 
  ON public.content_items FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own content
CREATE POLICY "Users can insert their own content" 
  ON public.content_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own content
CREATE POLICY "Users can update their own content" 
  ON public.content_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own content
CREATE POLICY "Users can delete their own content" 
  ON public.content_items FOR DELETE
  USING (auth.uid() = user_id);
```

## Apply Database Migrations

Apply your migrations to the database:

```sh
# Apply migrations
supabase db push
```

During development, you can reset the database if needed:

```sh
# Reset and reapply all migrations (development only)
supabase db reset --linked
```

## Create Product Service Hook

Create a new hook for your product-specific functionality in `hooks/useProductService.ts`:

```tsx
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";
import { useAuth } from "./useAuth";

export function useProductService() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Implement your product-specific functions here
  // Example for a content calendar:
  const createItem = async (title: string, content: string, scheduledDate?: Date) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("content_items")
        .insert({ 
          title, 
          content, 
          scheduled_date: scheduledDate?.toISOString() 
        })
        .select();
        
      if (error) throw new Error(error.message);
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createItem,
    // Add more functions as needed
  };
}
```

## Testing

Create integration tests for your product service in `tests/integration/product_service.test.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { getOrCreateTestUser, cleanupTestUser } from "../test-utils/user-testing-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe("Product Service", () => {
  const testUser = {
    email: "test-product-user@example.com",
    password: "Test123!@#",
  };
  let userId: string;

  beforeAll(async () => {
    const user = await getOrCreateTestUser(testUser);
    userId = user.id!;
  }, 15000);

  afterAll(async () => {
    await cleanupTestUser(userId);
  }, 15000);

  test("can create a product item", async () => {
    // Test your product functionality
  });
});
```

Run your tests:

```sh
npm test tests/integration/product_service.test.ts
```

This tutorial provides the foundation for implementing your product's database schema and core functionality. In the next tutorials, we'll add authentication, storage, AI integration, and subscription management.
