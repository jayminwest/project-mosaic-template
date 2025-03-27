-- Create direct admin function for cancellation reasons
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

-- Create SQL execution function
CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO service_role;
