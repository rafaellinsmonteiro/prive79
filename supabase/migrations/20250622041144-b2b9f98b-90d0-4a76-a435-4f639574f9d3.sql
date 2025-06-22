
-- Adicionar colunas de visibilidade para model_photos
ALTER TABLE public.model_photos 
ADD COLUMN show_in_profile boolean DEFAULT true,
ADD COLUMN show_in_gallery boolean DEFAULT true;

-- Adicionar colunas de visibilidade para model_videos  
ALTER TABLE public.model_videos 
ADD COLUMN show_in_profile boolean DEFAULT true,
ADD COLUMN show_in_gallery boolean DEFAULT true;

-- Comentários para documentar as colunas
COMMENT ON COLUMN public.model_photos.show_in_profile IS 'Se a foto deve ser exibida no perfil da modelo';
COMMENT ON COLUMN public.model_photos.show_in_gallery IS 'Se a foto deve ser exibida na galeria pública';
COMMENT ON COLUMN public.model_videos.show_in_profile IS 'Se o vídeo deve ser exibido no perfil da modelo';
COMMENT ON COLUMN public.model_videos.show_in_gallery IS 'Se o vídeo deve ser exibido na galeria pública';
