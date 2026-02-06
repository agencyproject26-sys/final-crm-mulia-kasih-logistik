-- Change pic_name and phone from single text to text arrays
-- First, migrate existing data to array format

ALTER TABLE public.customers 
  ALTER COLUMN pic_name TYPE TEXT[] USING CASE WHEN pic_name IS NOT NULL THEN ARRAY[pic_name] ELSE NULL END,
  ALTER COLUMN phone TYPE TEXT[] USING CASE WHEN phone IS NOT NULL THEN ARRAY[phone] ELSE NULL END;