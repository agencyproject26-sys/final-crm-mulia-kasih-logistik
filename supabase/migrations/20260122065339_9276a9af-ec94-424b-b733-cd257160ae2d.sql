-- Create warehouse/gudang table for operational warehouse management
CREATE TABLE public.warehouses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  cbm NUMERIC,
  description TEXT,
  handling_in_out TEXT,
  daily_notes TEXT,
  quantity NUMERIC,
  unit_price NUMERIC,
  party TEXT,
  administration TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Authenticated users only
CREATE POLICY "Authenticated users can view warehouses" 
ON public.warehouses 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create warehouses" 
ON public.warehouses 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update warehouses" 
ON public.warehouses 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete warehouses" 
ON public.warehouses 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_warehouses_updated_at
BEFORE UPDATE ON public.warehouses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();