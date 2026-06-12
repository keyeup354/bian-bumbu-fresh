## Goal
Remove the n8n webhook from checkout, keep a thin `process-order` edge function that recomputes totals server-side and inserts into Supabase, and add admin status management on `/admin`. Existing column names (`customer_phone`, `delivery_address`, `items`, `total_amount`) are preserved.

## Steps

### 1. Database migration (RLS only — no schema rename)
- Keep existing `orders` columns intact.
- Drop policy `Block direct order inserts from clients`.
- Add INSERT policy for `service_role` only (edge function uses service role) — public/anon cannot insert directly.
- Keep SELECT policy: admin only.
- Add UPDATE policy: admin only (`has_role(auth.uid(), 'admin')`) so admins can change status.
- GRANTs: keep `service_role` ALL, `authenticated` SELECT/UPDATE; remove anon insert grant if present.

### 2. Edge function `process-order` (thin + secure)
- Strip out all n8n webhook code.
- Validate input with zod (name ≥2, phone regex, address ≥10, items non-empty).
- For each item: fetch product from `products` table by id, use **server-side price** (respect `flash_sale_price` if `is_flash_sale=true` and not expired, otherwise variant price by `variantId`, otherwise base `price`). Reject if product missing or `in_stock=false` / `stock < qty`.
- Recompute `total_amount` server-side.
- Insert into `orders` via service-role client with recomputed total and trusted item snapshot (name, price, qty, unit).
- Decrement stock via existing `decrement_product_stock` RPC per item.
- Return `{ orderId }`.
- Remove `WEBHOOK_URL` usage entirely.

### 3. Checkout (`src/components/CartSlideout.tsx`)
- Keep current invocation of `supabase.functions.invoke('process-order', ...)`.
- Remove the entire client-side `fetch('https://n8n.arry.my.id/webhook/...')` block.
- Keep existing UI/layout exactly as is (form fields, payment radio, summary, buttons).

### 4. Admin status UI (`src/components/admin/OrdersPanel.tsx`)
- Keep existing list/expand layout.
- In each expanded order, add a Select dropdown: `pending → processing → completed → cancelled`.
- On change: `supabase.from('orders').update({ status }).eq('id', id)` + toast + local state update.
- Add realtime subscription (`postgres_changes` on `orders`) so new orders appear without manual refresh.

### 5. Cleanup & verification
- Delete `WEBHOOK_URL` references from code (secret can stay in vault, unused).
- Run supabase linter after migration.
- Update memory: replace "SIM AI webhook" mention with "direct Supabase insert via process-order edge function".

## Files touched
- new migration: RLS policy updates on `orders`
- `supabase/functions/process-order/index.ts` — rewritten (no webhook, server-side pricing, direct insert)
- `src/components/CartSlideout.tsx` — remove n8n fetch block only
- `src/components/admin/OrdersPanel.tsx` — add status Select + realtime
- `mem://features/order-processing` — update

## Security guarantees
- Client cannot insert orders directly (RLS blocks anon/authenticated INSERT).
- Prices always come from the `products` table inside the edge function — client-sent prices are ignored.
- Only admins can read/update orders.
