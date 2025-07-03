-- Atualizar model_profiles para ter chat_user_id onde está NULL
UPDATE public.model_profiles 
SET chat_user_id = public.ensure_model_chat_user(model_id)
WHERE chat_user_id IS NULL AND is_active = true;

-- Corrigir políticas RLS para mensagens - permitir que modelos vejam mensagens de suas conversas
DROP POLICY IF EXISTS "Models can view messages from their conversations" ON public.messages;
CREATE POLICY "Models can view messages from their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.model_id IN (
        SELECT model_profiles.model_id 
        FROM public.model_profiles 
        WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
      )
    )
  );

-- Permitir que modelos enviem mensagens para suas conversas
DROP POLICY IF EXISTS "Models can send messages to their conversations" ON public.messages;
CREATE POLICY "Models can send messages to their conversations" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.model_id IN (
        SELECT model_profiles.model_id 
        FROM public.model_profiles 
        WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
      )
    )
  );

-- Permitir que modelos atualizem mensagens em suas conversas
DROP POLICY IF EXISTS "Models can update messages in their conversations" ON public.messages;
CREATE POLICY "Models can update messages in their conversations" 
  ON public.messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.model_id IN (
        SELECT model_profiles.model_id 
        FROM public.model_profiles 
        WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
      )
    )
  );

-- Corrigir políticas RLS para conversas - permitir que modelos vejam suas conversas
DROP POLICY IF EXISTS "Models can view their conversations" ON public.conversations;
CREATE POLICY "Models can view their conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (
    model_id IN (
      SELECT model_profiles.model_id 
      FROM public.model_profiles 
      WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
    )
  );

-- Permitir que modelos atualizem suas conversas
DROP POLICY IF EXISTS "Models can update their conversations" ON public.conversations;
CREATE POLICY "Models can update their conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (
    model_id IN (
      SELECT model_profiles.model_id 
      FROM public.model_profiles 
      WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
    )
  );

-- Permitir que modelos vejam indicadores de digitação de suas conversas
DROP POLICY IF EXISTS "Models can view typing indicators from their conversations" ON public.typing_indicators;
CREATE POLICY "Models can view typing indicators from their conversations" 
  ON public.typing_indicators 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = typing_indicators.conversation_id 
      AND conversations.model_id IN (
        SELECT model_profiles.model_id 
        FROM public.model_profiles 
        WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
      )
    )
  );

-- Permitir que modelos gerenciem indicadores de digitação em suas conversas
DROP POLICY IF EXISTS "Models can manage typing indicators in their conversations" ON public.typing_indicators;
CREATE POLICY "Models can manage typing indicators in their conversations" 
  ON public.typing_indicators 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = typing_indicators.conversation_id 
      AND conversations.model_id IN (
        SELECT model_profiles.model_id 
        FROM public.model_profiles 
        WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
      )
    )
  );