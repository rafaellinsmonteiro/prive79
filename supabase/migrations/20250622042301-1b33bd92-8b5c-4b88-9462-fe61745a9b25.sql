
-- Adicionar controle de visibilidade para modelos
ALTER TABLE public.models 
ADD COLUMN visibility_type text DEFAULT 'public' CHECK (visibility_type IN ('public', 'plans')),
ADD COLUMN allowed_plan_ids uuid[] DEFAULT NULL;

-- Adicionar controle de visibilidade para fotos
ALTER TABLE public.model_photos 
ADD COLUMN visibility_type text DEFAULT 'public' CHECK (visibility_type IN ('public', 'plans')),
ADD COLUMN allowed_plan_ids uuid[] DEFAULT NULL;

-- Adicionar controle de visibilidade para vídeos  
ALTER TABLE public.model_videos 
ADD COLUMN visibility_type text DEFAULT 'public' CHECK (visibility_type IN ('public', 'plans')),
ADD COLUMN allowed_plan_ids uuid[] DEFAULT NULL;

-- Comentários para documentar as colunas
COMMENT ON COLUMN public.models.visibility_type IS 'Tipo de visibilidade: public (público) ou plans (restrito a planos)';
COMMENT ON COLUMN public.models.allowed_plan_ids IS 'IDs dos planos que podem acessar quando visibility_type = plans';
COMMENT ON COLUMN public.model_photos.visibility_type IS 'Tipo de visibilidade: public (público) ou plans (restrito a planos)';
COMMENT ON COLUMN public.model_photos.allowed_plan_ids IS 'IDs dos planos que podem acessar quando visibility_type = plans';
COMMENT ON COLUMN public.model_videos.visibility_type IS 'Tipo de visibilidade: public (público) ou plans (restrito a planos)';
COMMENT ON COLUMN public.model_videos.allowed_plan_ids IS 'IDs dos planos que podem acessar quando visibility_type = plans';
