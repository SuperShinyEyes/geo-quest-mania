-- Create a table for game scores
CREATE TABLE public.scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read scores (for leaderboard)
CREATE POLICY "Anyone can view scores" 
ON public.scores 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert scores (for submitting scores)
CREATE POLICY "Anyone can insert scores" 
ON public.scores 
FOR INSERT 
WITH CHECK (true);

-- Create index for better performance when ordering by score
CREATE INDEX idx_scores_score_desc ON public.scores (score DESC, created_at DESC);