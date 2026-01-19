-- Create vendors table for master data vendor
CREATE TABLE public.vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  company_name TEXT NOT NULL,
  pic_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  vendor_type TEXT DEFAULT 'trucking',
  services TEXT,
  npwp TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_name TEXT,
  status TEXT DEFAULT 'aktif'
);

-- Enable Row Level Security
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor access (similar to customers)
CREATE POLICY "Anyone can view vendors" 
ON public.vendors 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create vendors" 
ON public.vendors 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update vendors" 
ON public.vendors 
FOR UPDATE 
USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete vendors" 
ON public.vendors 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON public.vendors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();