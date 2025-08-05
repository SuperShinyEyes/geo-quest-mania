-- Create function to update timestamps first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create visitor tracking table
CREATE TABLE public.visitor_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  visitor_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on visit_date to ensure one record per day
ALTER TABLE public.visitor_stats ADD CONSTRAINT unique_visit_date UNIQUE (visit_date);

-- Enable RLS
ALTER TABLE public.visitor_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can view visitor stats" 
ON public.visitor_stats 
FOR SELECT 
USING (true);

-- Create function to increment visitor count
CREATE OR REPLACE FUNCTION public.increment_visitor_count()
RETURNS void AS $$
BEGIN
  INSERT INTO public.visitor_stats (visit_date, visitor_count)
  VALUES (CURRENT_DATE, 1)
  ON CONFLICT (visit_date)
  DO UPDATE SET 
    visitor_count = visitor_stats.visitor_count + 1,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get current visitor stats
CREATE OR REPLACE FUNCTION public.get_visitor_stats()
RETURNS TABLE (
  now_count BIGINT,
  today_count INTEGER,
  all_time_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Simulate real-time count (random between 1-50)
    (floor(random() * 50) + 1)::BIGINT as now_count,
    -- Today's count
    COALESCE((SELECT visitor_count FROM public.visitor_stats WHERE visit_date = CURRENT_DATE), 0) as today_count,
    -- All time count
    COALESCE((SELECT SUM(visitor_count) FROM public.visitor_stats), 0)::BIGINT as all_time_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_visitor_stats_updated_at
BEFORE UPDATE ON public.visitor_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();