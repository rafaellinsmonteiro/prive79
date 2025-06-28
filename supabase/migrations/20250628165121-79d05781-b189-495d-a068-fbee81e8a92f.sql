
-- Criar enum para status das mensagens
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read');

-- Criar enum para tipos de mensagem
CREATE TYPE message_type AS ENUM ('text', 'image', 'video', 'audio', 'file');

-- Tabela para conversas
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  model_id UUID REFERENCES public.models(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Tabela para mensagens
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'model')),
  message_type message_type NOT NULL DEFAULT 'text',
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  file_name TEXT,
  file_size INTEGER,
  status message_status NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para indicar quando usuário está digitando
CREATE TABLE public.typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para configurações do chat
CREATE TABLE public.chat_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  max_file_size_mb INTEGER NOT NULL DEFAULT 10,
  allowed_file_types TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'audio/mpeg', 'audio/wav'],
  auto_delete_messages_days INTEGER,
  enable_typing_indicators BOOLEAN NOT NULL DEFAULT true,
  enable_read_receipts BOOLEAN NOT NULL DEFAULT true,
  enable_file_upload BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.chat_settings (is_enabled) VALUES (true);

-- Habilitar Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para conversas
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Políticas para mensagens
CREATE POLICY "Users can view messages from their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations" 
  ON public.messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Políticas para indicadores de digitação
CREATE POLICY "Users can view typing indicators from their conversations" 
  ON public.typing_indicators 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = typing_indicators.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage typing indicators in their conversations" 
  ON public.typing_indicators 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = typing_indicators.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

-- Políticas para configurações do chat (apenas admin)
CREATE POLICY "Admin can manage chat settings" 
  ON public.chat_settings 
  FOR ALL 
  USING (public.is_admin());

CREATE POLICY "Users can view chat settings" 
  ON public.chat_settings 
  FOR SELECT 
  TO authenticated;

-- Índices para performance
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_conversations_model_id ON public.conversations(model_id);
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_typing_indicators_conversation_id ON public.typing_indicators(conversation_id);

-- Habilitar realtime para as tabelas
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.typing_indicators REPLICA IDENTITY FULL;

-- Adicionar tabelas ao realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.typing_indicators;

-- Função para atualizar timestamp de última mensagem
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at, updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar última mensagem
CREATE TRIGGER update_conversation_last_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Função para limpar indicadores de digitação antigos
CREATE OR REPLACE FUNCTION cleanup_old_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM public.typing_indicators 
  WHERE updated_at < now() - INTERVAL '30 seconds';
END;
$$ LANGUAGE plpgsql;
