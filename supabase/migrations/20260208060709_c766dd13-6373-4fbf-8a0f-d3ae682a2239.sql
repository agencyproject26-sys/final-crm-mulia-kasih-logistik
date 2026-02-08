
-- Create table for user approval status
CREATE TABLE public.user_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;

-- Users can read their own approval status
CREATE POLICY "Users can view their own approval"
ON public.user_approvals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage all approvals
CREATE POLICY "Admins can manage all approvals"
ON public.user_approvals
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create pending approval on new user signup via trigger
CREATE OR REPLACE FUNCTION public.create_pending_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_approvals (user_id, status)
  VALUES (NEW.id, 'pending')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_approval
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_pending_approval();

-- Auto-approve admin users
CREATE OR REPLACE FUNCTION public.auto_approve_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    INSERT INTO public.user_approvals (user_id, status)
    VALUES (NEW.user_id, 'approved')
    ON CONFLICT (user_id) DO UPDATE SET status = 'approved', updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_admin_role_auto_approve
AFTER INSERT ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.auto_approve_admin();

-- Approve the existing admin user
INSERT INTO public.user_approvals (user_id, status)
SELECT ur.user_id, 'approved'
FROM public.user_roles ur
WHERE ur.role = 'admin'
ON CONFLICT (user_id) DO UPDATE SET status = 'approved';
