-- Primeiro, vou criar chat_users para modelos que não têm
INSERT INTO public.chat_users (user_id, chat_display_name)
SELECT DISTINCT 
  mp.user_id,
  m.name
FROM public.model_profiles mp
JOIN public.models m ON m.id = mp.model_id
WHERE mp.is_active = true 
  AND mp.chat_user_id IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.chat_users cu WHERE cu.user_id = mp.user_id
  );

-- Agora atualizar os model_profiles com os chat_user_id
UPDATE public.model_profiles 
SET chat_user_id = (
  SELECT cu.id 
  FROM public.chat_users cu 
  WHERE cu.user_id = model_profiles.user_id
)
WHERE chat_user_id IS NULL AND is_active = true;