
-- Verificar e criar políticas apenas se não existirem

-- Adicionar políticas RLS para model_profiles (verificar se já existem)
DO $$ 
BEGIN
    -- Model profiles policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'model_profiles' 
        AND policyname = 'Users can view their own model profiles'
    ) THEN
        CREATE POLICY "Users can view their own model profiles" 
          ON public.model_profiles 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'model_profiles' 
        AND policyname = 'Users can create their own model profiles'
    ) THEN
        CREATE POLICY "Users can create their own model profiles" 
          ON public.model_profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'model_profiles' 
        AND policyname = 'Users can update their own model profiles'
    ) THEN
        CREATE POLICY "Users can update their own model profiles" 
          ON public.model_profiles 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;

    -- Conversations policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can view conversations they participate in'
    ) THEN
        CREATE POLICY "Users can view conversations they participate in" 
          ON public.conversations 
          FOR SELECT 
          USING (
            EXISTS (
              SELECT 1 FROM public.chat_users 
              WHERE chat_users.id IN (conversations.sender_chat_id, conversations.receiver_chat_id)
              AND chat_users.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can create conversations'
    ) THEN
        CREATE POLICY "Users can create conversations" 
          ON public.conversations 
          FOR INSERT 
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM public.chat_users 
              WHERE chat_users.id = conversations.sender_chat_id
              AND chat_users.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'conversations' 
        AND policyname = 'Users can update their conversations'
    ) THEN
        CREATE POLICY "Users can update their conversations" 
          ON public.conversations 
          FOR UPDATE 
          USING (
            EXISTS (
              SELECT 1 FROM public.chat_users 
              WHERE chat_users.id IN (conversations.sender_chat_id, conversations.receiver_chat_id)
              AND chat_users.user_id = auth.uid()
            )
          );
    END IF;
END $$;

-- Função para criar chat_user automaticamente para modelos quando necessário
CREATE OR REPLACE FUNCTION public.ensure_model_chat_user(model_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  chat_user_id UUID;
  model_profile_record RECORD;
BEGIN
  -- Buscar o model_profile para esta modelo
  SELECT * INTO model_profile_record
  FROM public.model_profiles 
  WHERE model_profiles.model_id = ensure_model_chat_user.model_id 
  AND is_active = true 
  LIMIT 1;
  
  IF model_profile_record IS NULL THEN
    RAISE EXCEPTION 'Model profile not found for model_id: %', model_id;
  END IF;
  
  -- Verificar se já existe um chat_user para este model_profile
  IF model_profile_record.chat_user_id IS NOT NULL THEN
    RETURN model_profile_record.chat_user_id;
  END IF;
  
  -- Criar chat_user para a modelo
  INSERT INTO public.chat_users (user_id, chat_display_name)
  SELECT 
    model_profile_record.user_id,
    models.name
  FROM public.models 
  WHERE models.id = ensure_model_chat_user.model_id
  RETURNING id INTO chat_user_id;
  
  -- Atualizar model_profile com o chat_user_id
  UPDATE public.model_profiles 
  SET chat_user_id = chat_user_id
  WHERE id = model_profile_record.id;
  
  RETURN chat_user_id;
END;
$$;
