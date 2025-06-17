
-- Criar enum para tipos de menu
CREATE TYPE public.menu_type AS ENUM ('url', 'category');

-- Criar enum para tipos de usuário
CREATE TYPE public.user_type AS ENUM ('guest', 'authenticated', 'all');

-- Criar tabela de itens do menu
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  menu_type menu_type NOT NULL,
  url TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Garantir que URL ou category_id seja fornecido baseado no tipo
  CONSTRAINT check_menu_item_data CHECK (
    (menu_type = 'url' AND url IS NOT NULL AND category_id IS NULL) OR
    (menu_type = 'category' AND category_id IS NOT NULL AND url IS NULL)
  )
);

-- Criar tabela de configurações do menu
CREATE TABLE public.menu_configurations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'all',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Evitar configurações duplicadas
  UNIQUE(menu_item_id, city_id, user_type)
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_configurations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para menu_items (somente leitura pública)
CREATE POLICY "Allow public read access to menu_items" 
  ON public.menu_items 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin full access to menu_items" 
  ON public.menu_items 
  FOR ALL 
  USING (public.is_admin());

-- Políticas RLS para menu_configurations (somente leitura pública)
CREATE POLICY "Allow public read access to menu_configurations" 
  ON public.menu_configurations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow admin full access to menu_configurations" 
  ON public.menu_configurations 
  FOR ALL 
  USING (public.is_admin());

-- Inserir alguns itens de menu padrão
INSERT INTO public.menu_items (title, menu_type, url, display_order) VALUES
('Início', 'url', '/', 1),
('Virtual', 'url', '/virtual', 3),
('Filtros', 'url', '/filtros', 4),
('Contato', 'url', '/contato', 5);

-- Configurar visibilidade para todas as cidades e tipos de usuário
INSERT INTO public.menu_configurations (menu_item_id, user_type)
SELECT id, 'all' FROM public.menu_items;
