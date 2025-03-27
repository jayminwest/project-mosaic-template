-- Create a function to execute SQL queries for testing
CREATE OR REPLACE FUNCTION public.create_sql_execution_function()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create function to execute SQL queries
  CREATE OR REPLACE FUNCTION public.execute_sql(sql_query text)
  RETURNS json
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $func$
  DECLARE
    result json;
  BEGIN
    EXECUTE 'SELECT json_agg(t) FROM (' || sql_query || ') t' INTO result;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
  END;
  $func$;

  -- Grant execute permission to authenticated users
  GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO service_role;
  
  RETURN 'SQL execution function created successfully';
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_sql_execution_function() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_sql_execution_function() TO service_role;

-- Create the SQL execution function immediately
SELECT public.create_sql_execution_function();
