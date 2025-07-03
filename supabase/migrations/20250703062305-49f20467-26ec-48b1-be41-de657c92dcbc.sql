-- Adicionar políticas RLS para mensagens - permitir que modelos vejam mensagens de suas conversas
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

-- Adicionar políticas RLS para conversas - permitir que modelos vejam suas conversas
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