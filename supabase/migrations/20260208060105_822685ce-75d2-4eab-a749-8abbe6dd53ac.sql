
-- Create table for user menu access permissions
CREATE TABLE public.user_menu_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  menu_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, menu_key)
);

-- Enable RLS
ALTER TABLE public.user_menu_access ENABLE ROW LEVEL SECURITY;

-- Users can read their own menu access
CREATE POLICY "Users can view their own menu access"
ON public.user_menu_access
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all menu access
CREATE POLICY "Admins can manage all menu access"
ON public.user_menu_access
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign all menus to admin users (trigger)
CREATE OR REPLACE FUNCTION public.assign_default_menu_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When admin role is assigned, give all menu access
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_menu_access (user_id, menu_key)
    VALUES 
      (NEW.user_id, 'dashboard'),
      (NEW.user_id, 'master-data'),
      (NEW.user_id, 'sales-crm'),
      (NEW.user_id, 'operasional'),
      (NEW.user_id, 'keuangan'),
      (NEW.user_id, 'laporan')
    ON CONFLICT (user_id, menu_key) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_role_assigned_menu_access
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.assign_default_menu_access();
