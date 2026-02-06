-- Drop existing admin-only delete policy
DROP POLICY IF EXISTS "Admins can delete invoice_dp" ON public.invoice_dp;

-- Create new policy allowing all authenticated roles to delete invoice_dp
CREATE POLICY "Role-based delete invoice_dp" 
ON public.invoice_dp 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);

-- Also update invoice_dp_items to allow cascading deletes
DROP POLICY IF EXISTS "Admins can delete invoice_dp_items" ON public.invoice_dp_items;

CREATE POLICY "Role-based delete invoice_dp_items" 
ON public.invoice_dp_items 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);