-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 5. RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Drop existing permissive expenses policies
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

-- 7. Create stricter expenses policies
-- Users can only view their own expenses, admins can view all
CREATE POLICY "Users can view own expenses"
ON public.expenses FOR SELECT
USING (
  created_by = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
);

-- Users can only create expenses assigned to themselves
CREATE POLICY "Users can create own expenses"
ON public.expenses FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Users can only update their own expenses, admins can update all
CREATE POLICY "Users can update own expenses"
ON public.expenses FOR UPDATE
USING (
  created_by = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  created_by = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
);

-- Users can only delete their own expenses, admins can delete all
CREATE POLICY "Users can delete own expenses"
ON public.expenses FOR DELETE
USING (
  created_by = auth.uid() 
  OR public.has_role(auth.uid(), 'admin')
);

-- 8. Assign existing expenses with NULL created_by to current authenticated admins
-- First, update any NULL created_by to indicate they are legacy records
-- We'll leave them as NULL but only admins can see them now