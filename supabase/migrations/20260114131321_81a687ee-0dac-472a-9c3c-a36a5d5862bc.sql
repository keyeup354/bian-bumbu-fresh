-- Create storage bucket for product media
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-media', 'product-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product media
CREATE POLICY "Anyone can view product media"
ON storage.objects
FOR SELECT
USING (bucket_id = 'product-media');

CREATE POLICY "Admins can upload product media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'product-media' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update product media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'product-media' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete product media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'product-media' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Add new columns to products table for media and educational content
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS health_benefits TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS cooking_tips TEXT DEFAULT '';