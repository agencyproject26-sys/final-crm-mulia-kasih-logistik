-- =====================================================
-- SECURITY FIX: Implement Role-Based Access Control
-- Replace permissive policies with RBAC restrictions
-- =====================================================

-- =====================================================
-- CUSTOMERS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can create customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can update customers" ON public.customers;
DROP POLICY IF EXISTS "Authenticated users can delete customers" ON public.customers;

CREATE POLICY "Role-based view customers"
  ON public.customers FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create customers"
  ON public.customers FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update customers"
  ON public.customers FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- VENDORS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can create vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can update vendors" ON public.vendors;
DROP POLICY IF EXISTS "Authenticated users can delete vendors" ON public.vendors;

CREATE POLICY "Role-based view vendors"
  ON public.vendors FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create vendors"
  ON public.vendors FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update vendors"
  ON public.vendors FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete vendors"
  ON public.vendors FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- INVOICES TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated insert on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated update on invoices" ON public.invoices;
DROP POLICY IF EXISTS "Allow authenticated delete on invoices" ON public.invoices;

CREATE POLICY "Role-based view invoices"
  ON public.invoices FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update invoices"
  ON public.invoices FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete invoices"
  ON public.invoices FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- INVOICE_ITEMS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow authenticated insert on invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow authenticated update on invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Allow authenticated delete on invoice_items" ON public.invoice_items;

CREATE POLICY "Role-based view invoice_items"
  ON public.invoice_items FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create invoice_items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update invoice_items"
  ON public.invoice_items FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete invoice_items"
  ON public.invoice_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- INVOICE_DP TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view invoice_dp" ON public.invoice_dp;
DROP POLICY IF EXISTS "Authenticated users can create invoice_dp" ON public.invoice_dp;
DROP POLICY IF EXISTS "Authenticated users can update invoice_dp" ON public.invoice_dp;
DROP POLICY IF EXISTS "Authenticated users can delete invoice_dp" ON public.invoice_dp;

CREATE POLICY "Role-based view invoice_dp"
  ON public.invoice_dp FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create invoice_dp"
  ON public.invoice_dp FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update invoice_dp"
  ON public.invoice_dp FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete invoice_dp"
  ON public.invoice_dp FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- INVOICE_DP_ITEMS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view invoice_dp_items" ON public.invoice_dp_items;
DROP POLICY IF EXISTS "Authenticated users can create invoice_dp_items" ON public.invoice_dp_items;
DROP POLICY IF EXISTS "Authenticated users can update invoice_dp_items" ON public.invoice_dp_items;
DROP POLICY IF EXISTS "Authenticated users can delete invoice_dp_items" ON public.invoice_dp_items;

CREATE POLICY "Role-based view invoice_dp_items"
  ON public.invoice_dp_items FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create invoice_dp_items"
  ON public.invoice_dp_items FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update invoice_dp_items"
  ON public.invoice_dp_items FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete invoice_dp_items"
  ON public.invoice_dp_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- QUOTATIONS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view quotations" ON public.quotations;
DROP POLICY IF EXISTS "Allow authenticated insert on quotations" ON public.quotations;
DROP POLICY IF EXISTS "Allow authenticated update on quotations" ON public.quotations;
DROP POLICY IF EXISTS "Allow authenticated delete on quotations" ON public.quotations;

CREATE POLICY "Role-based view quotations"
  ON public.quotations FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create quotations"
  ON public.quotations FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update quotations"
  ON public.quotations FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete quotations"
  ON public.quotations FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- QUOTATION_ITEMS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view quotation_items" ON public.quotation_items;
DROP POLICY IF EXISTS "Allow authenticated insert on quotation_items" ON public.quotation_items;
DROP POLICY IF EXISTS "Allow authenticated update on quotation_items" ON public.quotation_items;
DROP POLICY IF EXISTS "Allow authenticated delete on quotation_items" ON public.quotation_items;

CREATE POLICY "Role-based view quotation_items"
  ON public.quotation_items FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create quotation_items"
  ON public.quotation_items FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update quotation_items"
  ON public.quotation_items FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete quotation_items"
  ON public.quotation_items FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- JOB_ORDERS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view job_orders" ON public.job_orders;
DROP POLICY IF EXISTS "Allow authenticated insert on job_orders" ON public.job_orders;
DROP POLICY IF EXISTS "Allow authenticated update on job_orders" ON public.job_orders;
DROP POLICY IF EXISTS "Allow authenticated delete on job_orders" ON public.job_orders;

CREATE POLICY "Role-based view job_orders"
  ON public.job_orders FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create job_orders"
  ON public.job_orders FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update job_orders"
  ON public.job_orders FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete job_orders"
  ON public.job_orders FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRUCKS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view trucks" ON public.trucks;
DROP POLICY IF EXISTS "Allow authenticated insert on trucks" ON public.trucks;
DROP POLICY IF EXISTS "Allow authenticated update on trucks" ON public.trucks;
DROP POLICY IF EXISTS "Allow authenticated delete on trucks" ON public.trucks;

CREATE POLICY "Role-based view trucks"
  ON public.trucks FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create trucks"
  ON public.trucks FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update trucks"
  ON public.trucks FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete trucks"
  ON public.trucks FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRACKINGS TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view trackings" ON public.trackings;
DROP POLICY IF EXISTS "Authenticated users can create trackings" ON public.trackings;
DROP POLICY IF EXISTS "Authenticated users can update trackings" ON public.trackings;
DROP POLICY IF EXISTS "Authenticated users can delete trackings" ON public.trackings;

CREATE POLICY "Role-based view trackings"
  ON public.trackings FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create trackings"
  ON public.trackings FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update trackings"
  ON public.trackings FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete trackings"
  ON public.trackings FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- WAREHOUSES TABLE - Role-based access
-- =====================================================
DROP POLICY IF EXISTS "Authenticated users can view warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Authenticated users can create warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Authenticated users can update warehouses" ON public.warehouses;
DROP POLICY IF EXISTS "Authenticated users can delete warehouses" ON public.warehouses;

CREATE POLICY "Role-based view warehouses"
  ON public.warehouses FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based create warehouses"
  ON public.warehouses FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Role-based update warehouses"
  ON public.warehouses FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

CREATE POLICY "Admins can delete warehouses"
  ON public.warehouses FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- EXPENSES TABLE - Update existing policies to fix legacy NULL records issue
-- =====================================================
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- View: owner sees own records, admins see all (legacy NULL records only visible to admins)
CREATE POLICY "Role-based view expenses"
  ON public.expenses FOR SELECT
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'admin')
  );

-- Insert: any user with role can create
CREATE POLICY "Role-based create expenses"
  ON public.expenses FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'moderator') OR
    has_role(auth.uid(), 'user')
  );

-- Update: owner can update own, admins can update all
CREATE POLICY "Role-based update expenses"
  ON public.expenses FOR UPDATE
  USING (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'admin')
  )
  WITH CHECK (
    created_by = auth.uid() OR
    has_role(auth.uid(), 'admin')
  );

-- Delete: only admins can delete
CREATE POLICY "Admins can delete expenses"
  ON public.expenses FOR DELETE
  USING (has_role(auth.uid(), 'admin'));