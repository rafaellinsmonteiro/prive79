
-- Criar tabela para campos personalizados
CREATE TABLE public.custom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'textarea', 'number', 'boolean', 'select', 'date', 'email', 'url')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  placeholder TEXT,
  help_text TEXT,
  options TEXT[], -- Para campos do tipo select
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar índices para melhor performance
CREATE INDEX idx_custom_fields_active ON public.custom_fields(is_active);
CREATE INDEX idx_custom_fields_order ON public.custom_fields(display_order);

-- Habilitar RLS
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem gerenciar campos personalizados
CREATE POLICY "Admin can manage custom fields" 
  ON public.custom_fields 
  FOR ALL 
  USING (public.is_admin());

-- Política para leitura pública dos campos ativos (para exibir nos formulários)
CREATE POLICY "Anyone can view active custom fields" 
  ON public.custom_fields 
  FOR SELECT 
  USING (is_active = true);
