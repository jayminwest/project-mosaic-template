-- Add subscription status fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT,
ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMP WITH TIME ZONE;

-- Create index for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status
ON public.profiles(subscription_status);
