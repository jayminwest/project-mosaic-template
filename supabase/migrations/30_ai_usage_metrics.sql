-- Create AI interactions table
CREATE TABLE public.ai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  prompt_length INTEGER NOT NULL,
  response_length INTEGER NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for secure access
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Users can only read their own AI interactions
CREATE POLICY "Users can read their own AI interactions" 
  ON public.ai_interactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can only insert their own AI interactions
CREATE POLICY "Users can insert their own AI interactions" 
  ON public.ai_interactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add AI usage metrics to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS ai_interactions_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_tokens_used INTEGER DEFAULT 0;

-- Create function to update AI usage metrics
CREATE OR REPLACE FUNCTION public.update_ai_usage_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the user's AI usage metrics
  UPDATE public.profiles
  SET 
    ai_interactions_count = ai_interactions_count + 1,
    ai_tokens_used = ai_tokens_used + (NEW.prompt_length + NEW.response_length)
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update metrics on new AI interaction
CREATE TRIGGER update_ai_usage_metrics_trigger
AFTER INSERT ON public.ai_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_ai_usage_metrics();
