CREATE TABLE IF NOT EXISTS public.cancellation_reasons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  reason TEXT,
  subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.cancellation_reasons ENABLE ROW LEVEL SECURITY;

-- Users can insert their own cancellation reasons
CREATE POLICY "Users can insert their own cancellation reasons" 
  ON public.cancellation_reasons FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own cancellation reasons
CREATE POLICY "Users can view their own cancellation reasons" 
  ON public.cancellation_reasons FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Only the user who created the reason can delete it
CREATE POLICY "Users can delete their own cancellation reasons" 
  ON public.cancellation_reasons FOR DELETE 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_cancellation_reasons_user_id ON public.cancellation_reasons(user_id);
