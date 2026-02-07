-- Add dp_items JSONB column to all three invoice tables to persist individual DP entries
ALTER TABLE public.invoices ADD COLUMN dp_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.invoices_reimbursement ADD COLUMN dp_items jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.invoices_final ADD COLUMN dp_items jsonb DEFAULT '[]'::jsonb;