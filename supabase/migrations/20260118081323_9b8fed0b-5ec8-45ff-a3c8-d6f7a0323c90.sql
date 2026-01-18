-- Create customers (pelanggan) table
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  pic_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  customer_type TEXT CHECK (customer_type IN ('eksportir', 'importir', 'keduanya')) DEFAULT 'keduanya',
  status TEXT CHECK (status IN ('aktif', 'tidak_aktif')) DEFAULT 'aktif',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies - Allow public read access
CREATE POLICY "Anyone can view customers" 
ON public.customers 
FOR SELECT 
USING (true);

-- Create policies - Authenticated users can insert
CREATE POLICY "Authenticated users can create customers" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Create policies - Authenticated users can update
CREATE POLICY "Authenticated users can update customers" 
ON public.customers 
FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Create policies - Authenticated users can delete
CREATE POLICY "Authenticated users can delete customers" 
ON public.customers 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.customers (company_name, pic_name, phone, email, address, city, customer_type, status) VALUES
  ('PT Maju Bersama', 'Ahmad Fadli', '08123456789', 'ahmad@majubersama.com', 'Jl. Sudirman No. 123', 'Jakarta', 'eksportir', 'aktif'),
  ('CV Sejahtera', 'Budi Santoso', '08234567890', 'budi@sejahtera.com', 'Jl. Raya Darmo No. 45', 'Surabaya', 'importir', 'aktif'),
  ('PT Global Trade', 'Cahyo Wibowo', '08345678901', 'cahyo@globaltrade.com', 'Jl. Pemuda No. 67', 'Semarang', 'keduanya', 'aktif'),
  ('PT Indo Cargo', 'Dedi Kurniawan', '08456789012', 'dedi@indocargo.com', 'Jl. Sultan Hasanuddin No. 89', 'Makassar', 'eksportir', 'tidak_aktif'),
  ('CV Mandiri', 'Eko Prasetyo', '08567890123', 'eko@mandiri.com', 'Jl. Asia Afrika No. 12', 'Bandung', 'importir', 'aktif');