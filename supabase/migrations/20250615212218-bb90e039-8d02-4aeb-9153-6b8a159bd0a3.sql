
-- Permite que apenas ADMINs possam inserir, atualizar e deletar associações modelo-categoria
CREATE POLICY "Admins podem inserir em model_categories"
  ON public.model_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar em model_categories"
  ON public.model_categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins podem deletar em model_categories"
  ON public.model_categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
