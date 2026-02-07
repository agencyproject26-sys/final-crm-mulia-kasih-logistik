
-- =============================================
-- INVOICES REIMBURSEMENT TABLE
-- =============================================
CREATE TABLE public.invoices_reimbursement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NULL,
  customer_city TEXT NULL,
  bl_number TEXT NULL,
  no_aju TEXT NULL,
  no_pen TEXT NULL,
  no_invoice TEXT NULL,
  description TEXT NULL,
  origin TEXT NULL,
  party TEXT NULL,
  flight_vessel TEXT NULL,
  delivery_date DATE NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  down_payment NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NULL DEFAULT 'draft'::text,
  notes TEXT NULL,
  job_order_id UUID NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices_reimbursement ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Role-based view invoices_reimbursement"
  ON public.invoices_reimbursement FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based create invoices_reimbursement"
  ON public.invoices_reimbursement FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based update invoices_reimbursement"
  ON public.invoices_reimbursement FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Admins can delete invoices_reimbursement"
  ON public.invoices_reimbursement FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_invoices_reimbursement_updated_at
  BEFORE UPDATE ON public.invoices_reimbursement
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INVOICE REIMBURSEMENT ITEMS TABLE
-- =============================================
CREATE TABLE public.invoice_reimbursement_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices_reimbursement(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_reimbursement_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Role-based view invoice_reimbursement_items"
  ON public.invoice_reimbursement_items FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based create invoice_reimbursement_items"
  ON public.invoice_reimbursement_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based update invoice_reimbursement_items"
  ON public.invoice_reimbursement_items FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Admins can delete invoice_reimbursement_items"
  ON public.invoice_reimbursement_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- INVOICES FINAL TABLE
-- =============================================
CREATE TABLE public.invoices_final (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NULL,
  customer_city TEXT NULL,
  bl_number TEXT NULL,
  no_aju TEXT NULL,
  no_pen TEXT NULL,
  no_invoice TEXT NULL,
  description TEXT NULL,
  origin TEXT NULL,
  party TEXT NULL,
  flight_vessel TEXT NULL,
  delivery_date DATE NULL,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  down_payment NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NULL DEFAULT 'draft'::text,
  notes TEXT NULL,
  job_order_id UUID NULL,
  deleted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices_final ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Role-based view invoices_final"
  ON public.invoices_final FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based create invoices_final"
  ON public.invoices_final FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based update invoices_final"
  ON public.invoices_final FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Admins can delete invoices_final"
  ON public.invoices_final FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_invoices_final_updated_at
  BEFORE UPDATE ON public.invoices_final
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- INVOICE FINAL ITEMS TABLE
-- =============================================
CREATE TABLE public.invoice_final_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices_final(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_final_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Role-based view invoice_final_items"
  ON public.invoice_final_items FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based create invoice_final_items"
  ON public.invoice_final_items FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Role-based update invoice_final_items"
  ON public.invoice_final_items FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role) OR has_role(auth.uid(), 'user'::app_role));

CREATE POLICY "Admins can delete invoice_final_items"
  ON public.invoice_final_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));
