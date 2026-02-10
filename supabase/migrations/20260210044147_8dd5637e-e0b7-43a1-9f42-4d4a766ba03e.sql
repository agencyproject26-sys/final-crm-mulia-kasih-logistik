
-- Create storage bucket for job order invoice files
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-order-invoices', 'job-order-invoices', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload invoice files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'job-order-invoices' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view invoice files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'job-order-invoices' 
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete invoice files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'job-order-invoices' 
  AND auth.role() = 'authenticated'
);
