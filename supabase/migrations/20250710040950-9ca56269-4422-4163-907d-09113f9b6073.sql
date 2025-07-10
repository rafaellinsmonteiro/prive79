-- Adicionar colunas para restrições de planos e ícones
ALTER TABLE public.custom_fields 
ADD COLUMN allowed_plan_ids UUID[],
ADD COLUMN icon_url TEXT;

ALTER TABLE public.custom_sections 
ADD COLUMN allowed_plan_ids UUID[];

-- Comentários para documentar as colunas
COMMENT ON COLUMN public.custom_fields.allowed_plan_ids IS 'Array de IDs de planos que podem ver este campo. NULL = todos os planos';
COMMENT ON COLUMN public.custom_fields.icon_url IS 'URL do ícone do campo (PNG ou SVG)';
COMMENT ON COLUMN public.custom_sections.allowed_plan_ids IS 'Array de IDs de planos que podem ver esta seção. NULL = todos os planos';