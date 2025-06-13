
-- Primeiro, criar a restrição única na coluna email
ALTER TABLE public.admin_users 
ADD CONSTRAINT admin_users_email_unique UNIQUE (email);

-- Tornar a coluna user_id nullable
ALTER TABLE public.admin_users ALTER COLUMN user_id DROP NOT NULL;

-- Inserir o usuário administrador (sem ON CONFLICT já que não deve existir)
INSERT INTO public.admin_users (email, role, is_active)
VALUES ('rafaellinsmonteiro@gmail.com', 'admin', true);

-- Atualizar a função is_admin para funcionar com user_id nullable
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE (user_id = auth.uid() OR (user_id IS NULL AND email = auth.email()))
    AND is_active = true
  );
$$;

-- Criar função para atualizar o user_id quando o usuário fizer login
CREATE OR REPLACE FUNCTION public.update_admin_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar o user_id na tabela admin_users se o email corresponder
  UPDATE public.admin_users 
  SET user_id = NEW.id 
  WHERE email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para atualizar automaticamente o user_id
DROP TRIGGER IF EXISTS on_auth_user_created_update_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_update_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_user_id();
