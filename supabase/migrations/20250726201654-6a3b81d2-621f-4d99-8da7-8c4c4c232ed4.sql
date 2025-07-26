-- Criar a modelo Lunna IA
INSERT INTO public.models (
    id,
    name,
    age,
    description,
    is_active,
    city_id,
    visibility_type,
    is_online
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    'Lunna IA',
    25,
    'Assistente inteligente especializada em ajudar você a encontrar a modelo perfeita. Faça perguntas sobre disponibilidade, características, serviços e muito mais!',
    true,
    (SELECT id FROM public.cities LIMIT 1), -- Pegar primeira cidade disponível
    'public',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    is_online = EXCLUDED.is_online;

-- Criar model_profile para a Lunna
INSERT INTO public.model_profiles (
    id,
    user_id,
    model_id,
    is_active,
    chat_user_id
) VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    NULL, -- AI não tem user_id real
    '00000000-0000-0000-0000-000000000002'::uuid,
    true,
    '00000000-0000-0000-0000-000000000001'::uuid -- Link com o chat_user da Lunna
) ON CONFLICT (id) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    chat_user_id = EXCLUDED.chat_user_id;