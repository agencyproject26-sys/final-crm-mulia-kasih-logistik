
-- Update expenses SELECT policy to allow all roles to view all data
DROP POLICY IF EXISTS "Role-based view expenses" ON public.expenses;
CREATE POLICY "Role-based view expenses"
ON public.expenses
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);

-- Update expenses UPDATE policy to allow all roles to update
DROP POLICY IF EXISTS "Role-based update expenses" ON public.expenses;
CREATE POLICY "Role-based update expenses"
ON public.expenses
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'moderator'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);
