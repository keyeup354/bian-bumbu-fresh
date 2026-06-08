
-- 1) Schema changes
ALTER TABLE public.products
  ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.products
  ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.products
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS variants jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2) Realtime
ALTER TABLE public.products REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'products'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.products';
  END IF;
END $$;

-- 3) updated_at trigger
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Atomic stock decrement (used by the process-order edge function via service role)
CREATE OR REPLACE FUNCTION public.decrement_product_stock(_id text, _qty integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.products
     SET stock = GREATEST(0, stock - _qty),
         in_stock = CASE WHEN GREATEST(0, stock - _qty) <= 0 THEN false ELSE in_stock END
   WHERE id = _id;
END;
$$;
REVOKE ALL ON FUNCTION public.decrement_product_stock(text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(text, integer) TO service_role;

-- 5) Seed initial catalog (idempotent)
INSERT INTO public.products
  (id, name, description, price, unit, category, image_url, stock, in_stock,
   is_flash_sale, flash_sale_price, media_urls, health_benefits, variants)
VALUES
  ('v1','Tomat Merah Segar','Tomat merah segar berkualitas tinggi, cocok untuk sambal atau masakan.',12000,'per 500g','vegetables','/products/tomat.jpg',50,true,true,8000,ARRAY['/products/tomat.jpg'],'Tomat kaya likopen, antioksidan kuat untuk jantung & kulit.','[]'::jsonb),
  ('v2','Bayam Hijau','Bayam segar hijau untuk sayur bening atau tumisan.',4000,'per ikat','vegetables','/products/bayam.jpg',100,true,false,NULL,ARRAY['/products/bayam.jpg'],'Kaya zat besi, vitamin A & K untuk tulang dan mata.','[]'::jsonb),
  ('v3','Wortel Lokal','Wortel manis dan renyah, cocok untuk sup, jus, atau campuran masakan.',8000,'per 250g','vegetables','/products/wortel.jpg',80,true,false,NULL,ARRAY['/products/wortel.jpg'],'Tinggi beta-karoten untuk mata dan kekebalan tubuh.','[]'::jsonb),
  ('v4','Kacang Panjang','Kacang panjang segar untuk tumis atau lalapan.',6000,'per ikat','vegetables','/products/kacang-panjang.jpg',60,true,true,4500,ARRAY['/products/kacang-panjang.jpg'],'Membantu kontrol gula darah dan kaya serat.','[]'::jsonb),
  ('v5','Kubis Putih','Kubis segar untuk asinan, tumisan, atau sayur sop.',10000,'per kg','vegetables','/products/kubis.jpg',40,true,false,NULL,ARRAY['/products/kubis.jpg'],'Kaya vitamin C & K, baik untuk kekebalan & tulang.','[]'::jsonb),
  ('v6','Timun Segar','Timun segar dan renyah untuk lalapan atau acar.',5000,'per 500g','vegetables','/products/timun.jpg',70,true,false,NULL,ARRAY['/products/timun.jpg'],'95% air, baik untuk hidrasi dan kulit.','[]'::jsonb),
  ('s1','Cabai Merah Keriting','Cabai merah keriting pedas, cocok untuk sambal dan bumbu masakan.',45000,'per kg','spices','/products/cabai.jpg',30,true,true,35000,ARRAY['/products/cabai.jpg'],'Mengandung capsaicin, meningkatkan metabolisme.','[]'::jsonb),
  ('s2','Jahe Emprit','Jahe emprit segar untuk bumbu masakan dan minuman hangat.',25000,'per 250g','spices','/products/jahe.jpg',45,true,false,NULL,ARRAY['/products/jahe.jpg'],'Meredakan mual & masuk angin, anti-inflamasi.','[]'::jsonb),
  ('p1','Tahu Putih','Tahu putih lembut dan fresh dari pabrik.',5000,'per 4 pcs','protein','/products/tahu.jpg',100,true,false,NULL,ARRAY['/products/tahu.jpg'],'Sumber protein nabati & kalsium.','[]'::jsonb),
  ('p2','Tempe Segar','Tempe segar berkualitas, dibuat dari kedelai pilihan.',8000,'per pack','protein','/products/tempe.jpg',80,true,true,6000,ARRAY['/products/tempe.jpg'],'Protein lengkap, probiotik baik untuk usus.','[]'::jsonb),
  ('e1','Bawang Merah','Bawang merah Brebes berkualitas tinggi untuk bumbu dapur.',35000,'per kg','essentials','/products/bawang-merah.jpg',50,true,false,NULL,ARRAY['/products/bawang-merah.jpg'],'Antibakteri alami, baik untuk jantung.','[]'::jsonb),
  ('e2','Bawang Putih','Bawang putih tunggal, aroma kuat dan tahan lama.',40000,'per kg','essentials','/products/bawang-putih.jpg',60,true,false,NULL,ARRAY['/products/bawang-putih.jpg'],'Antibiotik alami, menurunkan tekanan darah.','[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
