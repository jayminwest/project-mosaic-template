-- Fix any corrupted email_preferences data
UPDATE public.profiles
SET email_preferences = '{"marketing": false, "product_updates": true, "security": true}'::jsonb
WHERE email_preferences IS NULL 
   OR email_preferences::text LIKE '{"%:%"}' 
   OR email_preferences::text LIKE '{"0":%'
   OR email_preferences::text NOT LIKE '{"marketing":%';

-- Ensure the column is properly typed
ALTER TABLE public.profiles 
ALTER COLUMN email_preferences TYPE JSONB 
USING COALESCE(email_preferences, '{"marketing": false, "product_updates": true, "security": true}'::jsonb);
