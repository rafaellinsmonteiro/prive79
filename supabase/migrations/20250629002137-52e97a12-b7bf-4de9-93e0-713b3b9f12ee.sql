
-- Verificar se o usuário modelo@demo.com já existe na auth.users e criar o perfil correspondente
-- Primeiro, vamos buscar o user_id real do usuário modelo@demo.com da tabela auth.users
DO $$
DECLARE
    modelo_user_id UUID;
BEGIN
    -- Buscar o user_id real do usuário modelo@demo.com
    SELECT id INTO modelo_user_id 
    FROM auth.users 
    WHERE email = 'modelo@demo.com' 
    LIMIT 1;
    
    -- Se encontrou o usuário, criar/atualizar os registros necessários
    IF modelo_user_id IS NOT NULL THEN
        -- Inserir na system_users se não existir
        INSERT INTO public.system_users (user_id, email, name, user_role, is_active)
        VALUES (modelo_user_id, 'modelo@demo.com', 'Modelo Demo', 'modelo'::user_role, true)
        ON CONFLICT (email) DO UPDATE SET 
            user_id = EXCLUDED.user_id,
            user_role = EXCLUDED.user_role,
            is_active = EXCLUDED.is_active;
        
        -- Inserir na model_profiles se não existir
        INSERT INTO public.model_profiles (user_id, model_id, is_active)
        VALUES (modelo_user_id, '2418654e-b885-4af3-85af-806b3ac65a78'::uuid, true)
        ON CONFLICT (user_id, model_id) DO UPDATE SET 
            is_active = EXCLUDED.is_active;
            
        RAISE NOTICE 'Perfil de modelo criado/atualizado para user_id: %', modelo_user_id;
    ELSE
        RAISE NOTICE 'Usuário modelo@demo.com não encontrado na tabela auth.users';
    END IF;
END $$;
