
-- Change pic_name from text to text[]
ALTER TABLE public.vendors
  ALTER COLUMN pic_name TYPE text[]
  USING CASE WHEN pic_name IS NOT NULL THEN ARRAY[pic_name] ELSE NULL END;

-- Change phone from text to text[]
ALTER TABLE public.vendors
  ALTER COLUMN phone TYPE text[]
  USING CASE WHEN phone IS NOT NULL THEN ARRAY[phone] ELSE NULL END;
