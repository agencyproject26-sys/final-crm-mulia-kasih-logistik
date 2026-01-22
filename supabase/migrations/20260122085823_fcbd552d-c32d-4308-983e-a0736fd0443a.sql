-- Tighten RLS for expenses by adding per-user ownership

-- 1) Add ownership column (no FK to auth.users; store UUID only)
ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS created_by uuid;

-- 2) Ensure created_by is always set to the authenticated user on INSERT
CREATE OR REPLACE FUNCTION public.set_expenses_created_by()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Always set server-side; never trust client-supplied value
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_expenses_created_by ON public.expenses;
CREATE TRIGGER set_expenses_created_by
BEFORE INSERT ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.set_expenses_created_by();

-- 3) Keep updated_at accurate
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Replace permissive policies with ownership-based ones
DROP POLICY IF EXISTS "Users can view all expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses" ON public.expenses;

-- Read: only own rows (and legacy rows where created_by is NULL)
CREATE POLICY "Users can view own expenses"
ON public.expenses
FOR SELECT
TO authenticated
USING (created_by = auth.uid() OR created_by IS NULL);

-- Create: must be authenticated; created_by will be set by trigger
CREATE POLICY "Users can create own expenses"
ON public.expenses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- Update: only own rows (and legacy NULL rows)
CREATE POLICY "Users can update own expenses"
ON public.expenses
FOR UPDATE
TO authenticated
USING (created_by = auth.uid() OR created_by IS NULL)
WITH CHECK (created_by = auth.uid() OR created_by IS NULL);

-- Delete: only own rows (and legacy NULL rows)
CREATE POLICY "Users can delete own expenses"
ON public.expenses
FOR DELETE
TO authenticated
USING (created_by = auth.uid() OR created_by IS NULL);
