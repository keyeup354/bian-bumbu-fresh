# Migration Guide — Pindah ke Supabase Project Baru

Panduan untuk men-deploy backend Bian Bumbu ke project Supabase milikmu sendiri (di luar Lovable Cloud).

> ⚠️ **Penting:** Lovable Cloud tetap aktif di project ini dan tidak bisa di-disconnect. Berarti **preview di lovable.dev** akan tetap menunjuk ke DB Lovable Cloud (lama). Yang akan pakai DB baru hanya **deployment Vercel** kamu (karena env vars di Vercel sudah kamu override).

---

## 1. Jalankan SQL Migration

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard) → pilih project barumu.
2. Buka **SQL Editor** → New query.
3. Buka file `docs/fresh-start.sql` di repo ini, copy seluruh isinya, paste ke SQL Editor.
4. Klik **Run**. Harus sukses tanpa error.

Yang dibuat:
- Tables: `products`, `orders`, `promotions`, `user_roles`
- Enum: `app_role` (`admin`, `user`)
- Functions: `has_role`, `decrement_product_stock`, `update_updated_at_column`
- RLS policies + GRANTs
- Realtime publication untuk `orders` & `products`

---

## 2. Buat Storage Bucket

1. Di dashboard → **Storage** → **New bucket**.
2. Name: `product-media`
3. Centang **Public bucket**.
4. Save.

Policy untuk bucket sudah otomatis di-create oleh `fresh-start.sql`.

---

## 3. Deploy Edge Function `process-order`

Edge function hanya bisa di-deploy via Supabase CLI ke project barumu.

```bash
# Install CLI (sekali saja)
npm install -g supabase

# Login
supabase login

# Clone repo ini ke local kalau belum
git clone <repo-url>
cd <repo>

# Link ke project barumu (ambil ref dari URL dashboard)
supabase link --project-ref <PROJECT_REF_BARU>

# Deploy
supabase functions deploy process-order --no-verify-jwt
```

---

## 4. Set Edge Function Secrets

Di dashboard → **Project Settings** → **Edge Functions** → **Secrets**, tambahkan:

| Name | Value |
|---|---|
| `SUPABASE_URL` | URL project barumu (`https://<ref>.supabase.co`) |
| `SUPABASE_ANON_KEY` | Anon/publishable key dari Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key dari Settings → API |

> Sebagian Supabase project meng-inject ini otomatis — cek dulu, kalau sudah ada tidak perlu ditambahkan manual.

---

## 5. Buat Admin User

1. Di app yang sudah live di Vercel, signup pakai email kamu.
2. Di Supabase dashboard → **Authentication** → **Users** → copy UUID user kamu.
3. Di **SQL Editor**, jalankan:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('<paste-uuid-disini>', 'admin');
```

4. Logout & login ulang di app → akses `/admin`.

---

## 6. Verifikasi Vercel Env Vars

Di Vercel project settings → Environment Variables, pastikan:

```
VITE_SUPABASE_URL          = https://<ref-baru>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = <anon key baru>
VITE_SUPABASE_PROJECT_ID   = <ref-baru>
```

Lalu **Redeploy** project Vercel-mu.

---

## 7. Test End-to-End

1. Buka URL Vercel.
2. Lewati Address Gate.
3. Tambah produk ke cart (kalau katalog masih kosong, tambah produk dulu via `/admin`).
4. Checkout → harus berhasil insert ke `orders` table.
5. Cek di `/admin` → order baru muncul realtime.

---

## Troubleshooting

- **"permission denied for table X"** → GRANT belum jalan. Re-run section relevan di `fresh-start.sql`.
- **Checkout error "Failed to send a request to the Edge Function"** → Edge function belum di-deploy atau secret service role belum di-set.
- **Admin page kosong walau sudah login** → role `admin` belum di-insert ke `user_roles`.
- **Realtime tidak update** → cek di Database → Replication, pastikan `orders` & `products` di-enable.
