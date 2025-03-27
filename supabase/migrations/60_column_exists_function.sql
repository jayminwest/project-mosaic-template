-- Create a function to check if a column exists in a table
CREATE OR REPLACE FUNCTION public.column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  column_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_attribute
    WHERE attrelid = (table_name)::regclass
    AND attname = column_name
    AND NOT attisdropped
  ) INTO column_exists;
  
  RETURN column_exists;
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs (like table doesn't exist), return false
    RETURN false;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.column_exists(text, text) TO service_role;
