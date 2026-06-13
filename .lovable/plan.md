
## Goal
Kamu mau pindah dari Lovable Cloud ke project Supabase baru milikmu sendiri (env vars sudah di-set di Vercel). Karena Lovable Cloud tidak bisa mendorong migration atau deploy edge function ke project Supabase eksternal, aku akan menyiapkan **bundle migration + instruksi eksekusi manual** yang kamu jalankan sendiri di Supabase dashboard & CLI.

## Penting untuk dipahami dulu

1. **Lovable Cloud tetap aktif di project ini.** Tidak bisa di-disconnect. Itu artinya `.env` di repo (`VITE_SUPABASE_URL/PROJECT_ID/PUBLISHABLE_KEY`) akan tetap auto-generated menunjuk ke Lovable Cloud. Di **Vercel** kamu override env vars itu ke Supabase barumu — itu sudah benar dan akan jalan di production Vercel. Tapi **preview Lovable** akan tetap pakai Lovable Cloud (DB lama).
2. **Edge function `process-order` harus kamu deploy manual** ke Supabase barumu pakai Supabase CLI. Tool migration Lovable hanya mendorong ke Lovable Cloud.
3. **Secrets edge function** (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`) harus kamu set di Supabase project baru via dashboard.

## Steps

### 1. Buat satu file SQL lengkap: `supabase/migrations/fresh-start.sql`
Berisi semua yang dibutuhkan untuk fresh DB:

- **Enum `app_role`** (`admin`, `user`)
- **Tables:**
  - `products` (id text PK, name, description, price, unit, category, image_url, stock, in_stock, is_flash_sale, flash_sale_price, flash_sale_ends_at, media_urls, health_benefits, cooking_tips, variants jsonb, is_featured, created_at, updated_at)
  - `orders` (id uuid PK, customer_name, customer_phone, delivery_address, items jsonb, total_amount, status default 'pending', notes, created_at)
  - `promotions` (id, title, description, discount_percentage, banner_image_url, is_active, starts_at, ends_at, created_at)
  - `user_roles` (id, user_id refs auth.users, role app_role, created_at; UNIQUE(user_id, role))
- **GRANTs** per table (sesuai aturan public schema)
- **Enable RLS** + **policies**:
  - `products`: SELECT public; INSERT/UPDATE/DELETE admin-only
  - `promotions`: SELECT public; INSERT/UPDATE/DELETE admin-only
  - `orders`: INSERT service_role only; SELECT/UPDATE admin-only; no DELETE
  - `user_roles`: SELECT own row; no client-side INSERT/UPDATE/DELETE (admin via service role)
- **Functions** (security definer, search_path=public):
  - `has_role(_user_id uuid, _role app_role) returns boolean`
  - `decrement_product_stock(_id text, _qty integer) returns void`
  - `update_updated_at_column()` trigger function
- **Trigger** `update_products_updated_at` di `products`
- **Storage bucket** `product-media` (public) — note: bucket harus dibuat via dashboard atau CLI karena SQL bucket API berbeda; akan disediakan snippet `storage.buckets` insert
- **Realtime publication:** `ALTER PUBLICATION supabase_realtime ADD TABLE public.orders, public.products`

### 2. Buat `MIGRATION_GUIDE.md` di root project
Step-by-step buat kamu:

1. Login Supabase dashboard → SQL Editor → paste isi `fresh-start.sql` → Run
2. Buat storage bucket `product-media` (public) di Storage tab
3. Install Supabase CLI, `supabase login`, `supabase link --project-ref <ref-baru>`
4. `supabase functions deploy process-order --no-verify-jwt`
5. Set edge function secrets di dashboard (Settings → Edge Functions → Secrets): `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
6. Bikin admin user: signup lewat app, lalu di SQL editor: `INSERT INTO user_roles (user_id, role) VALUES ('<uuid>', 'admin');`
7. Verifikasi: cek di Vercel `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID` sudah menunjuk ke project baru → redeploy Vercel
8. Test checkout end-to-end

### 3. Tidak ada perubahan kode aplikasi
Schema & RLS dirancang identik dengan yang sekarang, jadi semua file React/edge function existing langsung kompatibel. Tidak perlu edit `CartSlideout.tsx`, `OrdersPanel.tsx`, `ProductsContext.tsx`, atau `process-order/index.ts`.

## Files yang dibuat
- `supabase/migrations/fresh-start.sql` — satu file SQL lengkap untuk paste ke Supabase baru
- `MIGRATION_GUIDE.md` — panduan eksekusi manual

## Yang TIDAK aku lakukan (dan kenapa)
- Tidak menjalankan migration via tool Lovable (itu akan masuk ke Lovable Cloud DB, bukan Supabase barumu)
- Tidak deploy edge function (Lovable tidak punya akses ke Supabase project eksternal)
- Tidak edit `.env` lokal (auto-generated oleh Lovable, akan ter-overwrite)

## Konfirmasi sebelum eksekusi
Kalau plan ini oke, klik **Implement plan** dan aku akan generate dua file di atas.
