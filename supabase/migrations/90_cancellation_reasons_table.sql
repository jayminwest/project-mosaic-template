-- Drop and recreate the cancellation_reasons table
DROP TABLE IF EXISTS public.cancellation_reasons;

CREATE TABLE public.cancellation_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  subscription_id TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.cancellation_reasons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read their own cancellation reasons" ON public.cancellation_reasons;
DROP POLICY IF EXISTS "Users can insert their own cancellation reasons" ON public.cancellation_reasons;
DROP POLICY IF EXISTS "Users can update their own cancellation reasons" ON public.cancellation_reasons;
DROP POLICY IF EXISTS "Users can delete their own cancellation reasons" ON public.cancellation_reasons;
DROP POLICY IF EXISTS "Service role can manage all cancellation reasons" ON public.cancellation_reasons;
DROP POLICY IF EXISTS "Users can view their own cancellation reasons" ON public.cancellation_reasons;
DROP POLICY IF EXISTS "Authenticated users can insert cancellation reasons" ON public.cancellation_reasons;

-- Users can read their own cancellation reasons
CREATE POLICY "Users can read their own cancellation reasons"
  ON public.cancellation_reasons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert cancellation reasons
CREATE POLICY "Authenticated users can insert cancellation reasons"
  ON public.cancellation_reasons
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Users can update their own cancellation reasons
CREATE POLICY "Users can update their own cancellation reasons"
  ON public.cancellation_reasons
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own cancellation reasons
CREATE POLICY "Users can delete their own cancellation reasons"
  ON public.cancellation_reasons
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all cancellation reasons
CREATE POLICY "Service role can manage all cancellation reasons"
  ON public.cancellation_reasons
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create a function to get cancellation reasons for a user
CREATE OR REPLACE FUNCTION public.get_cancellation_reasons(user_id_param UUID)
RETURNS SETOF public.cancellation_reasons
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.cancellation_reasons 
  WHERE user_id = user_id_param;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_cancellation_reasons(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_cancellation_reasons(UUID) TO service_role;

-- Add column to profiles table to track cancellation date if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'subscription_canceled_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN subscription_canceled_at TIMESTAMP WITH TIME ZONE;
  END IF;
END
$$;
