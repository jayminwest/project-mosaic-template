-- Create cancellation_reasons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cancellation_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id TEXT,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.cancellation_reasons ENABLE ROW LEVEL SECURITY;

-- Users can read their own cancellation reasons
CREATE POLICY "Users can read their own cancellation reasons"
  ON public.cancellation_reasons
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own cancellation reasons
CREATE POLICY "Users can insert their own cancellation reasons"
  ON public.cancellation_reasons
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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
