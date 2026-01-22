-- Create quotations table
CREATE TABLE public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number text NOT NULL,
  customer_id uuid REFERENCES public.customers(id),
  customer_name text NOT NULL,
  customer_address text,
  route text,
  status text DEFAULT 'draft',
  notes text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  section text NOT NULL, -- 'rates', 'green_line', 'red_line'
  item_no integer NOT NULL,
  description text NOT NULL,
  lcl_rate numeric,
  fcl_20_rate numeric,
  fcl_40_rate numeric,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotations
CREATE POLICY "Allow public read on quotations"
ON public.quotations FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert on quotations"
ON public.quotations FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update on quotations"
ON public.quotations FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete on quotations"
ON public.quotations FOR DELETE
USING (auth.uid() IS NOT NULL);

-- RLS Policies for quotation_items
CREATE POLICY "Allow public read on quotation_items"
ON public.quotation_items FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert on quotation_items"
ON public.quotation_items FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated update on quotation_items"
ON public.quotation_items FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated delete on quotation_items"
ON public.quotation_items FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();