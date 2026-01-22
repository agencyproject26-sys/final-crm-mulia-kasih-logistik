-- Create job_orders table
CREATE TABLE public.job_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_order_number TEXT NOT NULL,
  eta_kapal DATE,
  bl_number TEXT,
  no_invoice TEXT,
  aju TEXT,
  party TEXT,
  exp_do DATE,
  status_do TEXT DEFAULT 'pending',
  pembayaran_do TEXT DEFAULT 'belum_lunas',
  lokasi TEXT,
  tujuan TEXT,
  respond_bc TEXT,
  status_bl TEXT DEFAULT 'pending',
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.job_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow public read on job_orders" 
ON public.job_orders 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on job_orders" 
ON public.job_orders 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update on job_orders" 
ON public.job_orders 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete on job_orders" 
ON public.job_orders 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_job_orders_updated_at
BEFORE UPDATE ON public.job_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();