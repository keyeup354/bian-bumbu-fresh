-- =====================================================================
-- BUTUHSAYUR — Fresh Start Migration (manual, untuk Supabase project baru)
-- Jalankan SELURUH file ini di SQL Editor dashboard Supabase barumu.
-- JANGAN dijalankan di Lovable Cloud DB.
-- =====================================================================

-- ---------- 1. ENUM ----------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------- 2. UTILITY: updated_at trigger ----------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================================
-- 3. TABLE: products
-- =====================================================================
CREATE TABLE public.products (
  id                   text PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name                 text NOT NULL,
  description          text,
  price                numeric NOT NULL,
  unit                 text NOT NULL DEFAULT 'pack',
  category             text NOT NULL,
  image_url            text,
  stock                integer NOT NULL DEFAULT 100,
  in_stock             boolean NOT NULL DEFAULT true,
  is_flash_sale        boolean DEFAULT false,
  flash_sale_price     numeric,
  flash_sale_ends_at   timestamptz,
  media_urls           text[] DEFAULT '{}'::text[],
  health_benefits      text DEFAULT '',
  cooking_tips         text DEFAULT '',
  variants             jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_featured          boolean DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================================
-- 4. TABLE: orders
-- =====================================================================
CREATE TABLE public.orders (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name     text NOT NULL,
  customer_phone    text NOT NULL,
  delivery_address  text NOT NULL,
  items             jsonb NOT NULL,
  total_amount      numeric NOT NULL,
  status            text NOT NULL DEFAULT 'pending',
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 5. TABLE: promotions
-- =====================================================================
CREATE TABLE public.promotions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL,
  description          text,
  discount_percentage  integer,
  banner_image_url     text,
  is_active            boolean DEFAULT true,
  starts_at            timestamptz DEFAULT now(),
  ends_at              timestamptz,
  created_at           timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.promotions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promotions TO authenticated;
GRANT ALL ON public.promotions TO service_role;

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 6. TABLE: user_roles
-- =====================================================================
CREATE TABLE public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 7. SECURITY DEFINER FUNCTIONS
-- =====================================================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

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

-- =====================================================================
-- 8. RLS POLICIES
-- =====================================================================

-- products
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- promotions
CREATE POLICY "Promotions are viewable by everyone"
  ON public.promotions FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert promotions"
  ON public.promotions FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update promotions"
  ON public.promotions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete promotions"
  ON public.promotions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- orders
CREATE POLICY "Service role can insert orders"
  ON public.orders FOR INSERT TO service_role
  WITH CHECK (true);
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================================
-- 9. REALTIME PUBLICATION
-- =====================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;

-- =====================================================================
-- 10. STORAGE POLICIES (bucket "product-media" wajib dibuat dulu di dashboard)
-- =====================================================================
DO $$ BEGIN
  CREATE POLICY "Public read product-media"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'product-media');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can upload product-media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update product-media"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete product-media"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'product-media' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
