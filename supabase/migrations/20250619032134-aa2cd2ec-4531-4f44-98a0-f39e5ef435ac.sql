
-- Adicionar coluna parent_id à tabela menu_items para suportar hierarquia
ALTER TABLE public.menu_items ADD COLUMN parent_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE;

-- Adicionar índice para melhorar performance nas consultas hierárquicas
CREATE INDEX idx_menu_items_parent_id ON public.menu_items(parent_id);

-- Atualizar a constraint para permitir que itens pais não tenham URL nem categoria obrigatórias
-- (apenas itens filhos precisam ter conteúdo)
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS check_menu_item_data;

ALTER TABLE public.menu_items ADD CONSTRAINT check_menu_item_data CHECK (
  -- Itens pais (que não têm parent_id) podem não ter URL nem categoria
  (parent_id IS NULL) OR 
  -- Itens filhos (que têm parent_id) devem ter URL ou categoria
  (parent_id IS NOT NULL AND (
    (menu_type = 'url' AND url IS NOT NULL AND category_id IS NULL) OR
    (menu_type = 'category' AND category_id IS NOT NULL AND url IS NULL)
  ))
);
