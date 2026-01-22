-- Create expenses table for tracking all expense categories
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('truk', 'pelabuhan', 'shipping_line', 'gudang', 'operasional')),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  job_order_id UUID REFERENCES public.job_orders(id),
  vendor_id UUID REFERENCES public.vendors(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view all expenses" 
ON public.expenses 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Users can create expenses" 
ON public.expenses 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update expenses" 
ON public.expenses 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Users can delete expenses" 
ON public.expenses 
FOR DELETE 
TO authenticated
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();