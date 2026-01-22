-- Add job_order_id to invoices table for linking
ALTER TABLE public.invoices 
ADD COLUMN job_order_id UUID REFERENCES public.job_orders(id) ON DELETE SET NULL;

-- Add payment tracking columns to job_orders
ALTER TABLE public.job_orders
ADD COLUMN total_invoice_amount NUMERIC DEFAULT 0,
ADD COLUMN total_paid_amount NUMERIC DEFAULT 0,
ADD COLUMN payment_status TEXT DEFAULT 'unpaid';

-- Create index for faster lookups
CREATE INDEX idx_invoices_job_order_id ON public.invoices(job_order_id);