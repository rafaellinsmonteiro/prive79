-- Criar tabela para armazenar preferências e informações dos usuários da Lunna
CREATE TABLE public.lunna_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session_id TEXT NOT NULL UNIQUE, -- ID único da sessão do usuário
  user_name TEXT,
  preferred_cities TEXT[],
  preferred_age_range TEXT,
  preferred_price_range TEXT,
  preferred_services TEXT[],
  interaction_count INTEGER DEFAULT 1,
  last_interaction_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT, -- Notas importantes sobre o usuário
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_lunna_user_preferences_updated_at
  BEFORE UPDATE ON public.lunna_user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_lunna_user_preferences_session_id ON public.lunna_user_preferences(user_session_id);
CREATE INDEX idx_lunna_user_preferences_last_interaction ON public.lunna_user_preferences(last_interaction_at);

-- Habilitar RLS
ALTER TABLE public.lunna_user_preferences ENABLE ROW LEVEL SECURITY;

-- Permitir acesso público para a Lunna (controlado via edge function)
CREATE POLICY "Allow lunna access to user preferences" 
ON public.lunna_user_preferences 
FOR ALL 
USING (true) 
WITH CHECK (true);