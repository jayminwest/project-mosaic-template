-- Create admin functions for testing
CREATE OR REPLACE FUNCTION public.create_admin_functions()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create function to get cancellation reasons as admin
  CREATE OR REPLACE FUNCTION public.admin_get_cancellation_reasons(user_id_param UUID)
  RETURNS SETOF public.cancellation_reasons
  LANGUAGE sql
  SECURITY DEFINER
  AS $$
    SELECT * FROM public.cancellation_reasons 
    WHERE user_id = user_id_param;
  $$;

  -- Grant execute permission to authenticated users
  GRANT EXECUTE ON FUNCTION public.admin_get_cancellation_reasons(UUID) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.admin_get_cancellation_reasons(UUID) TO service_role;
  
  RETURN 'Admin functions created successfully';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_admin_functions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_admin_functions() TO service_role;

-- Create the admin functions immediately
SELECT public.create_admin_functions();
