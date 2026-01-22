-- Create tracking table for operational tracking
CREATE TABLE public.trackings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  aju TEXT,
  container_number TEXT,
  depo_kosongan TEXT,
  driver_name TEXT,
  driver_phone TEXT,
  plate_number TEXT,
  destination TEXT,
  status TEXT DEFAULT 'in_transit',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trackings ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Authenticated users only
CREATE POLICY "Authenticated users can view trackings" 
ON public.trackings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create trackings" 
ON public.trackings 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update trackings" 
ON public.trackings 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete trackings" 
ON public.trackings 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_trackings_updated_at
BEFORE UPDATE ON public.trackings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();