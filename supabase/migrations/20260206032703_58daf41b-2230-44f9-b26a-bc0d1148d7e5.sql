-- Update delete policy for customers to allow all authenticated roles
DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;

CREATE POLICY "Role-based delete customers" 
ON public.customers 
FOR DELETE 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);