-- Criar tabela para gerenciar ferramentas da Lunna
CREATE TABLE public.lunna_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT,
  function_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  parameters JSONB DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lunna_tools ENABLE ROW LEVEL SECURITY;

-- Policies para admins
CREATE POLICY "Admins can manage all lunna tools" 
ON public.lunna_tools 
FOR ALL 
USING (is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_lunna_tools_updated_at
BEFORE UPDATE ON public.lunna_tools
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir ferramentas padrão
INSERT INTO public.lunna_tools (name, label, description, function_name, category, display_order) VALUES
('buscar_modelos', 'Buscar Modelos', 'Busca modelos por critérios específicos (cidade, idade, preço)', 'buscar_modelos', 'busca', 1),
('buscar_modelos_geral', 'Buscar Modelos (Geral)', 'Busca geral de modelos sem filtros específicos', 'buscar_modelos_geral', 'busca', 2),
('estatisticas_prive', 'Estatísticas Prive', 'Obtém estatísticas gerais da plataforma', 'estatisticas_prive', 'dados', 3),
('salvar_preferencias_usuario', 'Salvar Preferências', 'Salva preferências e informações do usuário', 'salvar_preferencias_usuario', 'usuario', 4),
('buscar_preferencias_usuario', 'Buscar Preferências', 'Recupera preferências salvas do usuário', 'buscar_preferencias_usuario', 'usuario', 5);