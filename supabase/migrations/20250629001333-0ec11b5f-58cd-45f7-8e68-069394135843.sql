
-- Primeiro, vamos verificar se o usuário modelo@demo.com existe na tabela system_users
-- e criar um model_profile para ele usando o modelo existente
INSERT INTO public.model_profiles (user_id, model_id, is_active)
SELECT 
    su.user_id,
    '2418654e-b885-4af3-85af-806b3ac65a78'::uuid, -- ID do modelo Duda Felix
    true
FROM public.system_users su
WHERE su.email = 'modelo@demo.com'
  AND su.user_role = 'modelo'
  AND su.is_active = true
ON CONFLICT (user_id, model_id) DO NOTHING;

-- Se o usuário modelo@demo.com não existir na system_users, vamos criá-lo também
INSERT INTO public.system_users (user_id, email, name, user_role, is_active)
SELECT 
    'a70b4f2b-10b9-40fa-88e3-060a854acc12'::uuid, -- ID do auth user modelo@demo.com
    'modelo@demo.com',
    'Modelo Demo',
    'modelo'::user_role,
    true
ON CONFLICT (email) DO NOTHING;

-- Depois criar o model_profile se não existir
INSERT INTO public.model_profiles (user_id, model_id, is_active)
VALUES (
    'a70b4f2b-10b9-40fa-88e3-060a854acc12'::uuid,
    '2418654e-b885-4af3-85af-806b3ac65a78'::uuid,
    true
) ON CONFLICT (user_id, model_id) DO NOTHING;
