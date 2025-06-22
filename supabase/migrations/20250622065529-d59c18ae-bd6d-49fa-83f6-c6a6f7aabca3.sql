
-- Adicionar política RLS para permitir que usuários autenticados se insiram na tabela system_users
CREATE POLICY "Users can insert their own record" 
  ON public.system_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Adicionar política RLS para permitir que usuários vejam seu próprio registro
CREATE POLICY "Users can view their own record" 
  ON public.system_users 
  FOR SELECT 
  USING (auth.uid() = user_id);
