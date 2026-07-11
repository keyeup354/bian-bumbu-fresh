Rencana: Hubungkan Claude ke ButuhSayur via MCP dengan OAuth dan hak admin penuh.

Sekarang aplikasi sudah punya MCP server publik tanpa auth (hanya bisa baca produk). Supaya Claude bisa "otak-atik" ButuhSayur — melihat katalog, menambah/mengubah produk, mengelola stok, melihat & update pesanan, dan mengelola promosi — MCP harus dipasangi OAuth (Claude masuk sebagai user) dan dilengkapi tools admin.

### 1. Aktifkan OAuth server (managed Cloud Auth)
- Jalankan `supabase--configure_oauth_server` agar external client (Claude/Cursor) bisa minta izin login dan mendapat token.
- Ini menyalakan dynamic client registration dan consent endpoint untuk project Cloud Auth.

### 2. Buat consent route
- Tambah halaman `/src/pages/OAuthConsent.tsx` dan route di `src/App.tsx` di path `/.lovable/oauth/consent`.
- Consent route menangani:
  - Baca `authorization_id` dari query.
  - Kalau belum login, redirect ke login/signup sambil menyimpan URL consent penuh di `next`.
  - Setelah login, tampilkan dialog izin (client name, redirect URI, scope).
  - Tombol **Approve** / **Deny** memanggil `supabase.auth.oauth.approveAuthorization` / `denyAuthorization`.
  - Setelah approve, redirect ke URL yang dikembalikan provider.
- Pastikan login & signup page mengonsumsi `next` dan kembali ke consent URL, bukan ke `/`.

### 3. Ganti MCP auth ke OAuth
- Edit `src/lib/mcp/index.ts`:
  - Hapus `auth: none`.
  - Gunakan `auth.oauth.issuer({ issuer: "https://<project-ref>.supabase.co/auth/v1", acceptedAudiences: "authenticated" })`.
  - Issuer diambil dari `import.meta.env.VITE_SUPABASE_PROJECT_ID` agar tetap valid saat publish.

### 4. Helper Supabase dengan token OAuth
- Buat `src/lib/mcp/supabase-client.ts` yang menerima `ToolContext` dan mengembalikan Supabase client dengan header `Authorization: Bearer <token>`.
- Semua tool handler menggunakan helper ini agar RLS berjalan sebagai user yang login.

### 5. Perbarui tools yang sudah ada
- `list_products` dan `get_product`: tetap read-only, tapi sekarang memakai authenticated Supabase client agar bisa mengakses data yang sama seperti admin.
- Tetap `readOnlyHint: true`, `idempotentHint: true`, `openWorldHint: false`.

### 6. Tambah tools admin
Tools baru untuk kontrol penuh:
- **create_product**: buat produk baru (name, description, price, unit, category, stock, image_url, is_featured, is_flash_sale, flash_sale_price, flash_sale_ends_at).
- **update_product**: edit produk berdasarkan id.
- **delete_product**: hapus produk berdasarkan id.
- **update_stock**: ubah stok produk (id, qty_change atau new_stock).
- **list_orders**: daftar pesanan dengan filter status, urut created_at desc.
- **get_order**: detail satu pesanan.
- **update_order_status**: ubah status pesanan (pending, processing, completed, cancelled).
- **list_promotions**: daftar promosi aktif.
- **create_promotion**: buat promosi (title, description, discount_percentage, is_active, ends_at).
- **update_promotion**: edit promosi.
- **delete_promotion**: hapus promosi.

Setiap tool admin:
- Periksa `ctx.isAuthenticated()` dan `public.has_role(auth.uid(), 'admin')` melalui `user_roles`.
- Gunakan `needsApproval` untuk tool mutasi (create, update, delete, update status) sebagai pengaman tambahan.
- Gunakan helper Supabase dengan token agar RLS berlaku sebagai user admin.

### 7. Validasi dan deploy
- Jalankan `app_mcp_server--extract_mcp_manifest` untuk memastikan manifest ter-generate tanpa error.
- Jalankan `supabase--deploy_edge_functions` untuk deploy ulang fungsi `mcp`.
- Ujicoba lokal/endpoint dengan MCP inspector untuk memverifikasi OAuth flow dan tools admin.

### Catatan keamanan
- Token OAuth tidak akan ditampilkan di UI atau dikembalikan dalam tool response.
- Tools mutasi hanya bisa dipakai oleh user dengan role `admin` di tabel `user_roles`.
- Tanpa OAuth aktif, MCP server tidak akan di-deploy dalam mode admin.
- Consent route harus selalu menyimpan dan mengembalikan `authorization_id` penuh setelah login/signup.

### Deliverable akhir
Claude bisa connect ke ButuhSayur via MCP URL `https://<project-ref>.supabase.co/functions/v1/mcp`, login sebagai user admin, dan mengelola produk, stok, pesanan, serta promosi melalui conversation.