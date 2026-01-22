-- Fix PUBLIC_DATA_EXPOSURE issues: Replace public SELECT policies with authenticated-only policies

-- 1. Fix customers table - currently allows anyone to view
DROP POLICY IF EXISTS "Anyone can view customers" ON public.customers;
CREATE POLICY "Authenticated users can view customers" 
ON public.customers 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Fix vendors table - currently allows anyone to view (exposes bank details, NPWP, contacts)
DROP POLICY IF EXISTS "Anyone can view vendors" ON public.vendors;
CREATE POLICY "Authenticated users can view vendors" 
ON public.vendors 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 3. Fix quotations table - currently allows public read (exposes pricing strategy)
DROP POLICY IF EXISTS "Allow public read on quotations" ON public.quotations;
CREATE POLICY "Authenticated users can view quotations" 
ON public.quotations 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 4. Fix quotation_items table - currently allows public read (exposes pricing rates)
DROP POLICY IF EXISTS "Allow public read on quotation_items" ON public.quotation_items;
CREATE POLICY "Authenticated users can view quotation_items" 
ON public.quotation_items 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 5. Fix job_orders table - currently allows public read (exposes business operations)
DROP POLICY IF EXISTS "Allow public read on job_orders" ON public.job_orders;
CREATE POLICY "Authenticated users can view job_orders" 
ON public.job_orders 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 6. Fix trucks table - currently allows public read
DROP POLICY IF EXISTS "Allow public read access on trucks" ON public.trucks;
CREATE POLICY "Authenticated users can view trucks" 
ON public.trucks 
FOR SELECT 
USING (auth.uid() IS NOT NULL);