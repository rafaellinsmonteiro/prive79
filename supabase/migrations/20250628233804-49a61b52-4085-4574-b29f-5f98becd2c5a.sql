
-- Habilitar RLS na tabela model_profiles
ALTER TABLE public.model_profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam seus próprios perfis de modelo
CREATE POLICY "Users can view their own model profiles" 
  ON public.model_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários criem seus próprios perfis de modelo
CREATE POLICY "Users can create their own model profiles" 
  ON public.model_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios perfis de modelo
CREATE POLICY "Users can update their own model profiles" 
  ON public.model_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários deletem seus próprios perfis de modelo
CREATE POLICY "Users can delete their own model profiles" 
  ON public.model_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);
