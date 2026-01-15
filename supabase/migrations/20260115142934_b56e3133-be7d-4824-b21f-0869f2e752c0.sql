-- Enable admin management of promotions
CREATE POLICY "Admins can insert promotions"
ON public.promotions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update promotions"
ON public.promotions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete promotions"
ON public.promotions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));