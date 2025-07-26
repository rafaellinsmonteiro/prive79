-- Manter model_profile da Lunna com user_id NULL (já permitido na migração anterior)
-- Isso mantém a lógica simples sem criar usuários auth desnecessários
UPDATE public.model_profiles 
SET user_id = NULL
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;