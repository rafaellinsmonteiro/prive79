-- Corrigir a função ensure_model_chat_user para evitar ambiguidade
CREATE OR REPLACE FUNCTION public.ensure_model_chat_user(model_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  found_chat_user_id UUID;
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
  
  -- Verificar se já existe um chat_user para este user_id
  SELECT id INTO found_chat_user_id
  FROM public.chat_users 
  WHERE user_id = model_profile_record.user_id;
  
  -- Se não existe, criar um novo chat_user
  IF found_chat_user_id IS NULL THEN
    INSERT INTO public.chat_users (user_id, chat_display_name)
    SELECT 
      model_profile_record.user_id,
      models.name
    FROM public.models 
    WHERE models.id = ensure_model_chat_user.model_id
    RETURNING id INTO found_chat_user_id;
  END IF;
  
  -- Atualizar model_profile com o chat_user_id
  UPDATE public.model_profiles 
  SET chat_user_id = found_chat_user_id
  WHERE id = model_profile_record.id;
  
  RETURN found_chat_user_id;
END;
$function$;