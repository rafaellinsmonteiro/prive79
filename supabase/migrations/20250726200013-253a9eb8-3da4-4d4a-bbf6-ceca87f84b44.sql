-- Permitir user_id NULL para AIs especiais
ALTER TABLE public.chat_users ALTER COLUMN user_id DROP NOT NULL;

-- Criar o chat_user da Lunna IA
INSERT INTO public.chat_users (
    id,
    user_id,
    chat_display_name,
    username,
    is_active
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    NULL, -- AI especial não tem user_id real
    'Lunna IA',
    'lunna',
    true
) ON CONFLICT (id) DO UPDATE SET
    chat_display_name = EXCLUDED.chat_display_name,
    username = EXCLUDED.username,
    is_active = EXCLUDED.is_active;