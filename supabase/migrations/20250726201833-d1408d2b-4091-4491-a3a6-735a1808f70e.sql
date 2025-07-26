-- Criar system_user para Lunna IA
INSERT INTO public.system_users (
    id,
    user_id,
    email,
    name,
    user_role,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    '00000000-0000-0000-0000-000000000003'::uuid,
    'lunna@ai.system',
    'Lunna IA',
    'modelo',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active;

-- Atualizar model_profile para usar o user_id da Lunna
UPDATE public.model_profiles 
SET user_id = '00000000-0000-0000-0000-000000000003'::uuid
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;