-- Add invoice_pib_number column to invoice_dp table
ALTER TABLE public.invoice_dp
ADD COLUMN invoice_pib_number TEXT;