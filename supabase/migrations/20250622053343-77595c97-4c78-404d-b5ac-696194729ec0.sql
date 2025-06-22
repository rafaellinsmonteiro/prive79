
-- Primeiro, vamos verificar o user_id atual do usuário autenticado
SELECT auth.uid() as current_user_id, auth.email() as current_email;

-- Vamos atualizar o user_id na tabela admin_users para corresponder ao usuário autenticado
UPDATE public.admin_users 
SET user_id = (
  SELECT id FROM auth.users 
  WHERE email = 'rafaellinsmonteiro@gmail.com'
)
WHERE email = 'rafaellinsmonteiro@gmail.com';

-- Verificar se a atualização foi bem-sucedida
SELECT * FROM public.admin_users WHERE email = 'rafaellinsmonteiro@gmail.com';

-- Testar novamente a função is_admin()
SELECT public.is_admin() as is_admin_result;
