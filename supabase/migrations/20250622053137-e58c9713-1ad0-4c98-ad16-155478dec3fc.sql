
-- Inserir o usuário rafaellinsmonteiro@gmail.com na tabela admin_users
INSERT INTO public.admin_users (email, role, is_active)
VALUES ('rafaellinsmonteiro@gmail.com', 'admin', true)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- Verificar se a inserção foi bem-sucedida
SELECT * FROM public.admin_users WHERE email = 'rafaellinsmonteiro@gmail.com';
