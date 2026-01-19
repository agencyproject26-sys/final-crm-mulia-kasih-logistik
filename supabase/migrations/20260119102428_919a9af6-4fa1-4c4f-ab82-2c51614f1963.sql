-- Create trucks table for truck and driver management
CREATE TABLE public.trucks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  truck_id TEXT NOT NULL UNIQUE,
  plate_number TEXT NOT NULL,
  truck_type TEXT NOT NULL,
  capacity TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;

-- Create policies for truck access
CREATE POLICY "Allow public read access on trucks" 
ON public.trucks 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on trucks" 
ON public.trucks 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update on trucks" 
ON public.trucks 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete on trucks" 
ON public.trucks 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trucks_updated_at
BEFORE UPDATE ON public.trucks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();