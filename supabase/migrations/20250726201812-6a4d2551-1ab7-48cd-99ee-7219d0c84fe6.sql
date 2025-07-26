-- Criar usuário auth para Lunna IA
INSERT INTO auth.users (
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    '00000000-0000-0000-0000-000000000003'::uuid,
    'lunna@ai.system',
    now(),
    now(),
    now(),
    '{"name": "Lunna IA"}'::jsonb
) ON CONFLICT (id) DO NOTHING;

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
) ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    is_active = EXCLUDED.is_active;

-- Atualizar model_profile para usar o user_id da Lunna
UPDATE public.model_profiles 
SET user_id = '00000000-0000-0000-0000-000000000003'::uuid
WHERE id = '00000000-0000-0000-0000-000000000002'::uuid;