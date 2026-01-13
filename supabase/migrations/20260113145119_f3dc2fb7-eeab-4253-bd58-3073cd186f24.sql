-- Remove the public INSERT policy that allows direct database access bypass
DROP POLICY "Anyone can create orders" ON public.orders;