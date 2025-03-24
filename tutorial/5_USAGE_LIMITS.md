# Tutorial 5: Usage Limits and Subscription Tiers

This tutorial guides you through implementing usage tracking and limits for your Project Mosaic product. We'll create a system that enforces different usage limits based on subscription tiers.

## Usage Tracking Objectives

- **Tiered Usage Limits**: Implement different resource limits for free and premium users
- **Usage Tracking**: Monitor resource consumption without destructive resets
- **Limit Enforcement**: Prevent users from exceeding their plan's limits
- **Subscription-Based Limits**: Automatically adjust limits when users upgrade or downgrade

## Understanding the Usage Tracking Strategy

The template uses a scalable approach to usage tracking:

1. **Separate Usage Table**: Tracks usage with a composite primary key of `(user_id, year_month)`
2. **Non-Destructive Tracking**: Preserves historical usage data by month
3. **Automatic Enforcement**: Uses database triggers to enforce limits
4. **Subscription Integration**: Automatically updates limits when subscription changes

## Apply Usage Tracking Migrations

The template includes migration files for usage tracking:

1. `supabase/migrations/4_init_usage_tracking.sql`: Creates the usage tracking table
2. `supabase/migrations/5_init_usage_limit_triggers.sql`: Implements limit enforcement
3. `supabase/migrations/6_init_account_tier_triggers.sql`: Updates limits based on subscription

Apply these migrations:

```sh
supabase db push
```

## Customize for Your Product

Modify the usage tracking system for your specific product:

1. Create a new migration file `supabase/migrations/10_product_usage_tracking.sql`:

```sql
-- Update the usage_tracking table to include your product-specific metrics
ALTER TABLE public.usage_tracking 
ADD COLUMN IF NOT EXISTS your_product_metric integer DEFAULT 0;

-- Create a function to increment your product metric
CREATE OR REPLACE FUNCTION increment_product_metric()
RETURNS TRIGGER AS $$
DECLARE
  current_month TEXT;
  current_usage INT;
  user_limit INT;
BEGIN
  -- Get current month in YYYY-MM format
  current_month := to_char(now(), 'YYYY-MM');
  
  -- Get user's limit from profiles
  SELECT usage_limit INTO user_limit
  FROM public.profiles
  WHERE user_id = NEW.user_id;
  
  -- Get current usage for this month
  SELECT COALESCE(your_product_metric, 0) INTO current_usage
  FROM public.usage_tracking
  WHERE user_id = NEW.user_id AND year_month = current_month;
  
  -- If no record exists yet, current_usage will be null
  IF current_usage IS NULL THEN
    current_usage := 0;
  END IF;
  
  -- Check if creating this would exceed the limit
  IF current_usage >= user_limit THEN
    RAISE EXCEPTION 'Usage limit exceeded for the current month';
  END IF;
  
  -- Increment the usage counter
  INSERT INTO public.usage_tracking (user_id, year_month, your_product_metric)
  VALUES (NEW.user_id, current_month, 1)
  ON CONFLICT (user_id, year_month)
  DO UPDATE SET your_product_metric = public.usage_tracking.your_product_metric + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to increment the counter when a new item is created
CREATE TRIGGER increment_product_metric_after_insert
AFTER INSERT ON your_product_table
FOR EACH ROW
EXECUTE FUNCTION increment_product_metric();
```

2. Apply the migration:

```sh
supabase db push
```

## Update the Auth Hook

Modify the `useAuth` hook to fetch and display usage information:

```typescript
// In hooks/useAuth.ts
const fetchUserProfile = async (userId: string, userEmail: string) => {
  try {
    // Get current month in YYYY-MM format
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Query profile and usage data in parallel
    const [profileResponse, usageResponse] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase
        .from("usage_tracking")
        .select("*")  // Select all columns to get your product metric
        .eq("user_id", userId)
        .eq("year_month", currentMonth)
        .maybeSingle(),
    ]);
    
    if (profileResponse.error) throw profileResponse.error;
    
    // Combine profile and usage data
    setUser({
      ...profileResponse.data,
      email: userEmail,
      // Add your product-specific usage metric
      product_usage: usageResponse.data?.your_product_metric || 0,
    });
  } catch (error: any) {
    console.error("Error fetching user profile:", error.message);
    setError(error.message);
  }
};
```

## Create a Usage Display Component

Create a component to display usage information:

```tsx
// components/UsageDisplay.tsx
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function UsageDisplay() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const usageLimit = user.usage_limit || 100;
  const currentUsage = user.product_usage || 0;
  const usagePercentage = Math.min((currentUsage / usageLimit) * 100, 100);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>
              {currentUsage} / {usageLimit} {user.subscription_plan === "premium" ? "Premium" : "Free"}
            </span>
            <span>{Math.round(usagePercentage)}%</span>
          </div>
          
          <Progress value={usagePercentage} className="h-2" />
          
          {usagePercentage >= 80 && (
            <p className="text-sm text-amber-500">
              You're approaching your usage limit for this month.
              {user.subscription_plan !== "premium" && " Consider upgrading to Premium."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Add Usage Limit Handling in Your Product Service

Update your product service to handle usage limit errors:

```typescript
// In hooks/useProductService.ts
const createItem = async (title: string, content: string) => {
  try {
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from("your_product_table")
      .insert({ title, content })
      .select();
      
    if (error) {
      // Check for usage limit error
      if (error.message.includes("Usage limit exceeded")) {
        setError("You've reached your usage limit for this month. Please upgrade your plan to continue.");
      } else {
        setError(error.message);
      }
      return null;
    }
    
    return data;
  } catch (err: any) {
    setError(err.message);
    return null;
  } finally {
    setIsLoading(false);
  }
};
```

## Testing

Create tests for your usage limits in `tests/integration/5_usage_limits.test.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";
import { getOrCreateTestUser, cleanupTestUser } from "../test-utils/user-testing-utils";
import { setUserSubscriptionTier, setProductUsageCount } from "../test-utils/limit-testing-utils";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

describe("Usage Limits", () => {
  const testUser = {
    email: "test-limits-user@example.com",
    password: "Test123!@#",
  };
  let userId: string;

  beforeAll(async () => {
    const user = await getOrCreateTestUser(testUser);
    userId = user.id!;
    
    // Sign in as the test user
    await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password,
    });
  }, 15000);

  afterAll(async () => {
    await cleanupTestUser(userId);
  }, 15000);

  test("free user can create items within limit", async () => {
    // Set user to free tier
    await setUserSubscriptionTier(userId, "free");
    
    // Reset usage count
    await setProductUsageCount(userId, 0);
    
    // Create an item
    const { data, error } = await supabase
      .from("your_product_table")
      .insert({ title: "Test Item", content: "Test content" })
      .select();
      
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });

  test("free user cannot exceed usage limit", async () => {
    // Set user to free tier
    await setUserSubscriptionTier(userId, "free");
    
    // Set usage to limit
    await setProductUsageCount(userId, 100);
    
    // Try to create another item
    const { error } = await supabase
      .from("your_product_table")
      .insert({ title: "Limit Test", content: "This should fail" });
      
    expect(error).not.toBeNull();
    expect(error!.message).toContain("Usage limit exceeded");
  });

  test("premium user can exceed free tier limit", async () => {
    // Set user to premium tier
    await setUserSubscriptionTier(userId, "premium");
    
    // Set usage to just above free tier limit
    await setProductUsageCount(userId, 101);
    
    // Create an item
    const { data, error } = await supabase
      .from("your_product_table")
      .insert({ title: "Premium Test", content: "This should work" })
      .select();
      
    expect(error).toBeNull();
    expect(data).not.toBeNull();
  });
});
```

Run the tests:

```sh
npm test tests/integration/5_usage_limits.test.ts
```

This tutorial provides a foundation for implementing usage limits in your Project Mosaic product. The system automatically tracks usage, enforces limits based on subscription tier, and provides a good user experience by showing usage information and appropriate upgrade prompts.
