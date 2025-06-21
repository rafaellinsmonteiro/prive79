
-- Criar enum para tipos de usuário
CREATE TYPE public.user_role AS ENUM ('admin', 'modelo', 'cliente');

-- Criar tabela de planos
CREATE TABLE public.plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de categorias de planos
CREATE TABLE public.plan_categories (
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (plan_id, category_id)
);

-- Criar tabela de usuários do sistema
CREATE TABLE public.system_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  user_role user_role NOT NULL DEFAULT 'cliente',
  plan_id UUID REFERENCES public.plans(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plans (somente leitura pública, admin pode tudo)
CREATE POLICY "Allow public read access to plans" 
  ON public.plans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Allow admin full access to plans" 
  ON public.plans 
  FOR ALL 
  USING (public.is_admin());

-- Políticas RLS para plan_categories (somente leitura pública, admin pode tudo)
CREATE POLICY "Allow public read access to plan_categories" 
  ON public.plan_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin full access to plan_categories" 
  ON public.plan_categories 
  FOR ALL 
  USING (public.is_admin());

-- Políticas RLS para system_users (admin pode tudo)
CREATE POLICY "Allow admin full access to system_users" 
  ON public.system_users 
  FOR ALL 
  USING (public.is_admin());

-- Inserir alguns planos de exemplo
INSERT INTO public.plans (name, description, price, display_order) VALUES
('Básico', 'Plano básico com funcionalidades essenciais', 29.90, 1),
('Premium', 'Plano premium com funcionalidades avançadas', 59.90, 2),
('VIP', 'Plano VIP com todas as funcionalidades', 99.90, 3);
