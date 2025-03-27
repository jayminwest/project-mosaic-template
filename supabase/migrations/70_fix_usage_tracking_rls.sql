-- Fix RLS policies for usage_tracking table
-- First, check if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_tracking') THEN
    -- Drop existing RLS policies if they exist
    DROP POLICY IF EXISTS "Users can read their own usage_tracking" ON public.usage_tracking;
    DROP POLICY IF EXISTS "Users can insert their own usage_tracking" ON public.usage_tracking;
    DROP POLICY IF EXISTS "Users can update their own usage_tracking" ON public.usage_tracking;
    
    -- Enable RLS on the table
    ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
    
    -- Create proper RLS policies
    CREATE POLICY "Users can read their own usage_tracking" 
      ON public.usage_tracking FOR SELECT 
      USING (auth.uid() = user_id);
      
    CREATE POLICY "Users can insert their own usage_tracking" 
      ON public.usage_tracking FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
      
    CREATE POLICY "Users can update their own usage_tracking" 
      ON public.usage_tracking FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create a function to initialize usage tracking for new users
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_tracking') THEN
    CREATE OR REPLACE FUNCTION public.initialize_usage_tracking()
    RETURNS TRIGGER AS $func$
    DECLARE
      current_year_month TEXT;
    BEGIN
      current_year_month := to_char(CURRENT_DATE, 'YYYY-MM');
      
      -- Insert initial usage tracking record
      INSERT INTO public.usage_tracking (
        user_id, 
        year_month, 
        storage_used, 
        api_calls, 
        resources_used, 
        projects_created
      ) VALUES (
        NEW.user_id,
        current_year_month,
        0,
        0,
        0,
        0
      ) ON CONFLICT (user_id, year_month) DO NOTHING;
      
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Create a trigger to initialize usage tracking when a new profile is created
    DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
    CREATE TRIGGER on_profile_created
      AFTER INSERT ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.initialize_usage_tracking();
      
    -- Backfill existing profiles with usage tracking records
    INSERT INTO public.usage_tracking (
      user_id, 
      year_month, 
      storage_used, 
      api_calls, 
      resources_used, 
      projects_created
    )
    SELECT 
      p.user_id,
      to_char(CURRENT_DATE, 'YYYY-MM'),
      0,
      0,
      0,
      0
    FROM 
      public.profiles p
    LEFT JOIN 
      public.usage_tracking ut 
    ON 
      p.user_id = ut.user_id AND 
      ut.year_month = to_char(CURRENT_DATE, 'YYYY-MM')
    WHERE 
      ut.user_id IS NULL
    ON CONFLICT (user_id, year_month) DO NOTHING;
  END IF;
END
$$;
