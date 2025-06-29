
-- Primeiro, vamos verificar se o usuário modelo@demo.com existe na tabela system_users
-- e obter seu user_id
INSERT INTO public.model_profiles (user_id, model_id, is_active)
SELECT 
    su.user_id,
    '2418654e-b885-4af3-85af-806b3ac65a78'::uuid,
    true
FROM public.system_users su
WHERE su.email = 'modelo@demo.com'
  AND su.user_role = 'modelo'
  AND su.is_active = true
ON CONFLICT (user_id, model_id) DO NOTHING;
