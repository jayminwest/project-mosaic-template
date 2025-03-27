-- Create a function to reset subscription data
CREATE OR REPLACE FUNCTION public.reset_subscription_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset subscription data in profiles table
  UPDATE public.profiles
  SET 
    subscription_plan = 'free',
    subscription_status = NULL,
    subscription_trial_end = NULL;
  
  -- Reset usage tracking data
  DELETE FROM public.usage_tracking;
  
  -- Reset AI interactions data
  DELETE FROM public.ai_interactions;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.reset_subscription_data() TO service_role;
