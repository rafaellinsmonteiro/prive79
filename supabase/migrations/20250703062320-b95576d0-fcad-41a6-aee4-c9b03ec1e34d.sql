-- Permitir que modelos vejam indicadores de digitação de suas conversas
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