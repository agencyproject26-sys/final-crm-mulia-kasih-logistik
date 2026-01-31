-- Add title and quotation_date columns to quotations table
ALTER TABLE public.quotations 
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS quotation_date DATE NOT NULL DEFAULT CURRENT_DATE;