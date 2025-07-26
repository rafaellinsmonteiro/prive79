-- Criar um chat_user especial para a Lunna IA
-- Primeiro, vamos criar um user_id fictício para a Lunna
DO $$
DECLARE
    lunna_user_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    -- Inserir o chat_user da Lunna
    INSERT INTO public.chat_users (
        id,
        user_id,
        chat_display_name,
        username,
        is_active
    ) VALUES (
        lunna_user_id,
        lunna_user_id, -- Usar o mesmo ID como user_id
        'Lunna IA',
        'lunna',
        true
    ) ON CONFLICT (id) DO UPDATE SET
        chat_display_name = EXCLUDED.chat_display_name,
        username = EXCLUDED.username,
        is_active = EXCLUDED.is_active;
        
    RAISE NOTICE 'Lunna IA chat user created with ID: %', lunna_user_id;
END $$;