
-- Criar tabela para configurações gerais do módulo de reels
CREATE TABLE public.reels_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  auto_play BOOLEAN NOT NULL DEFAULT true,
  show_controls BOOLEAN NOT NULL DEFAULT false,
  max_duration INTEGER DEFAULT 60, -- duração máxima em segundos
  items_per_page INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir configurações padrão
INSERT INTO public.reels_settings (is_enabled, auto_play, show_controls, max_duration, items_per_page) 
VALUES (true, true, false, 60, 10);

-- Adicionar campo para marcar vídeos como featured nos reels
ALTER TABLE public.model_videos 
ADD COLUMN IF NOT EXISTS is_featured_in_reels BOOLEAN DEFAULT false;

-- Criar índice para melhor performance na busca de vídeos featured
CREATE INDEX IF NOT EXISTS idx_model_videos_featured_reels 
ON public.model_videos (is_featured_in_reels) 
WHERE is_featured_in_reels = true;

-- Criar tabela para categorias específicas de reels (opcional)
CREATE TABLE public.reels_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de associação entre vídeos e categorias de reels
CREATE TABLE public.model_video_reels_categories (
  video_id UUID NOT NULL REFERENCES public.model_videos(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.reels_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (video_id, category_id)
);

-- Adicionar RLS nas novas tabelas (apenas admins podem modificar)
ALTER TABLE public.reels_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_video_reels_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para reels_settings
CREATE POLICY "Admins can manage reels settings"
  ON public.reels_settings
  FOR ALL
  USING (public.is_admin());

-- Políticas para reels_categories
CREATE POLICY "Everyone can view reels categories"
  ON public.reels_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage reels categories"
  ON public.reels_categories
  FOR ALL
  USING (public.is_admin());

-- Políticas para model_video_reels_categories
CREATE POLICY "Everyone can view video reels categories"
  ON public.model_video_reels_categories
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage video reels categories"
  ON public.model_video_reels_categories
  FOR ALL
  USING (public.is_admin());
