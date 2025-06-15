
-- Permite que apenas ADMINs possam inserir, atualizar e deletar categorias
CREATE POLICY "Admins podem inserir categorias"
  ON public.categories
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins podem atualizar categorias"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins podem deletar categorias"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
