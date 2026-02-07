
-- Add deleted_at column to all main tables for soft delete support
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.trucks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.job_orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.invoice_dp ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.quotations ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.trackings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE public.warehouses ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create indexes for better query performance on deleted_at
CREATE INDEX IF NOT EXISTS idx_customers_deleted_at ON public.customers(deleted_at);
CREATE INDEX IF NOT EXISTS idx_vendors_deleted_at ON public.vendors(deleted_at);
CREATE INDEX IF NOT EXISTS idx_trucks_deleted_at ON public.trucks(deleted_at);
CREATE INDEX IF NOT EXISTS idx_job_orders_deleted_at ON public.job_orders(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON public.invoices(deleted_at);
CREATE INDEX IF NOT EXISTS idx_invoice_dp_deleted_at ON public.invoice_dp(deleted_at);
CREATE INDEX IF NOT EXISTS idx_expenses_deleted_at ON public.expenses(deleted_at);
CREATE INDEX IF NOT EXISTS idx_quotations_deleted_at ON public.quotations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_trackings_deleted_at ON public.trackings(deleted_at);
CREATE INDEX IF NOT EXISTS idx_warehouses_deleted_at ON public.warehouses(deleted_at);
