-- Drop the old blocking policy
DROP POLICY IF EXISTS "Block direct order inserts from clients" ON public.orders;

-- Only service_role (edge function) can insert orders
DROP POLICY IF EXISTS "Service role can insert orders" ON public.orders;
CREATE POLICY "Service role can insert orders"
  ON public.orders
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Admins can update orders (e.g. status changes)
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Ensure grants
REVOKE INSERT ON public.orders FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Enable realtime for orders so admin sees new orders in real time
ALTER TABLE public.orders REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
  END IF;
END $$;