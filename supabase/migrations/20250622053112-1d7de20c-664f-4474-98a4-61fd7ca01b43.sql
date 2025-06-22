
-- Verificar se o usuário existe na tabela admin_users
SELECT * FROM public.admin_users WHERE email = 'rafaellinsmonteiro@gmail.com';

-- Verificar também na tabela system_users
SELECT * FROM public.system_users WHERE email = 'rafaellinsmonteiro@gmail.com';

-- Testar a função is_admin() para este usuário específico
SELECT public.is_admin() as is_admin_result;
