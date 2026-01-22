-- Create table for Invoice DP (Down Payment) with multi-part support
CREATE TABLE public.invoice_dp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_dp_number TEXT NOT NULL,
  part_number INTEGER NOT NULL DEFAULT 1,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_city TEXT,
  bl_number TEXT,
  description TEXT,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for Invoice DP items
CREATE TABLE public.invoice_dp_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_dp_id UUID NOT NULL REFERENCES public.invoice_dp(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_dp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_dp_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for invoice_dp
CREATE POLICY "Authenticated users can view invoice_dp" 
  ON public.invoice_dp FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create invoice_dp" 
  ON public.invoice_dp FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update invoice_dp" 
  ON public.invoice_dp FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete invoice_dp" 
  ON public.invoice_dp FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- RLS policies for invoice_dp_items
CREATE POLICY "Authenticated users can view invoice_dp_items" 
  ON public.invoice_dp_items FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create invoice_dp_items" 
  ON public.invoice_dp_items FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update invoice_dp_items" 
  ON public.invoice_dp_items FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete invoice_dp_items" 
  ON public.invoice_dp_items FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_invoice_dp_updated_at
  BEFORE UPDATE ON public.invoice_dp
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();