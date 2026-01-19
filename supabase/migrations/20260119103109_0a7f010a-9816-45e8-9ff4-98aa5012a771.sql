-- Create invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  no_aju TEXT,
  bl_number TEXT,
  
  -- Customer info
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_city TEXT,
  
  -- Shipment details
  party TEXT,
  flight_vessel TEXT,
  origin TEXT,
  no_pen TEXT,
  description TEXT,
  delivery_date DATE,
  
  -- Payment details
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  down_payment DECIMAL(15,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft',
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create invoice line items table
CREATE TABLE public.invoice_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for invoices
CREATE POLICY "Allow public read on invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated update on invoices" ON public.invoices FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated delete on invoices" ON public.invoices FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policies for invoice_items
CREATE POLICY "Allow public read on invoice_items" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Allow authenticated insert on invoice_items" ON public.invoice_items FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated update on invoice_items" ON public.invoice_items FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Allow authenticated delete on invoice_items" ON public.invoice_items FOR DELETE USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();