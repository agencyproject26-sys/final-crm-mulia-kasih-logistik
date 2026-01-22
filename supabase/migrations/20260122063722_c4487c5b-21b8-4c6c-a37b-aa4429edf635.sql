-- Fix invoice table: Remove public read policy and require authentication
DROP POLICY IF EXISTS "Allow public read on invoices" ON public.invoices;

CREATE POLICY "Authenticated users can view invoices" 
ON public.invoices 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix invoice_items table: Remove public read policy and require authentication
DROP POLICY IF EXISTS "Allow public read on invoice_items" ON public.invoice_items;

CREATE POLICY "Authenticated users can view invoice_items" 
ON public.invoice_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);