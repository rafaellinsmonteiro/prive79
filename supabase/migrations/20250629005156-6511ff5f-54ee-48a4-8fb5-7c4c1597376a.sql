
-- Criar tabela para usuários do chat (independente de modelos/clientes)
CREATE TABLE public.chat_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  chat_display_name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Adicionar RLS para chat_users
ALTER TABLE public.chat_users ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem apenas seus próprios dados do chat
CREATE POLICY "Users can view their own chat profile" 
  ON public.chat_users 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat profile" 
  ON public.chat_users 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat profile" 
  ON public.chat_users 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Atualizar tabela model_profiles para referenciar chat_users
ALTER TABLE public.model_profiles 
ADD COLUMN chat_user_id UUID REFERENCES public.chat_users(id);

-- Função para criar automaticamente um chat_user quando um usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_chat_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.chat_users (user_id, chat_display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger para criar chat_user automaticamente
CREATE TRIGGER on_auth_user_created_chat
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_chat_user();

-- Atualizar conversas para usar chat_user_ids ao invés de user_id/model_id
ALTER TABLE public.conversations 
ADD COLUMN sender_chat_id UUID REFERENCES public.chat_users(id),
ADD COLUMN receiver_chat_id UUID REFERENCES public.chat_users(id);

-- Migrar dados existentes (opcional - para conversas existentes)
-- UPDATE public.conversations 
-- SET sender_chat_id = (SELECT id FROM public.chat_users WHERE user_id = conversations.user_id LIMIT 1);
