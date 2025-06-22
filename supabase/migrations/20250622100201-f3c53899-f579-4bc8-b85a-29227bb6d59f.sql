
-- Adicionar colunas para os campos personalizados que foram criados
-- Baseado no erro, vejo que há um campo "tatuagem" sendo usado
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS tatuagem boolean DEFAULT false;

-- Adicionar outros campos personalizados comuns que podem ter sido criados
-- (apenas se não existirem)
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS olhos text;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS cabelo text;
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS etnia text;

-- Adicionar coluna section à tabela custom_fields se não existir
ALTER TABLE public.custom_fields ADD COLUMN IF NOT EXISTS section text DEFAULT 'Campos Personalizados';

-- Função para adicionar colunas dinamicamente quando campos personalizados são criados
CREATE OR REPLACE FUNCTION add_custom_field_column()
RETURNS trigger AS $$
BEGIN
  -- Adicionar a coluna à tabela models se for um campo ativo
  IF NEW.is_active = true THEN
    EXECUTE format('ALTER TABLE public.models ADD COLUMN IF NOT EXISTS %I %s',
      NEW.field_name,
      CASE NEW.field_type
        WHEN 'boolean' THEN 'boolean DEFAULT false'
        WHEN 'number' THEN 'numeric'
        WHEN 'date' THEN 'date'
        ELSE 'text'
      END
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para adicionar colunas automaticamente quando campos são criados
DROP TRIGGER IF EXISTS trigger_add_custom_field_column ON public.custom_fields;
CREATE TRIGGER trigger_add_custom_field_column
  AFTER INSERT OR UPDATE ON public.custom_fields
  FOR EACH ROW
  EXECUTE FUNCTION add_custom_field_column();

-- Adicionar RLS policies para custom_fields se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_fields' 
    AND policyname = 'Admin can manage custom fields'
  ) THEN
    CREATE POLICY "Admin can manage custom fields" 
      ON public.custom_fields 
      FOR ALL 
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_fields' 
    AND policyname = 'Anyone can view active custom fields'
  ) THEN
    CREATE POLICY "Anyone can view active custom fields" 
      ON public.custom_fields 
      FOR SELECT 
      USING (is_active = true);
  END IF;
END $$;

-- Adicionar RLS policies para custom_sections se não existirem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_sections' 
    AND policyname = 'Admin can manage custom sections'
  ) THEN
    CREATE POLICY "Admin can manage custom sections" 
      ON public.custom_sections 
      FOR ALL 
      USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'custom_sections' 
    AND policyname = 'Anyone can view active custom sections'
  ) THEN
    CREATE POLICY "Anyone can view active custom sections" 
      ON public.custom_sections 
      FOR SELECT 
      USING (is_active = true);
  END IF;
END $$;
