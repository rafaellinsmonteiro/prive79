-- Adicionar campos para organização de mídias

-- Adicionar campos de organização às tabelas de fotos e vídeos
ALTER TABLE model_photos 
ADD COLUMN folder_id UUID DEFAULT NULL,
ADD COLUMN stage TEXT DEFAULT 'Organizar',
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN created_by_user_id UUID DEFAULT NULL;

ALTER TABLE model_videos 
ADD COLUMN folder_id UUID DEFAULT NULL,
ADD COLUMN stage TEXT DEFAULT 'Organizar',
ADD COLUMN tags TEXT[] DEFAULT '{}',
ADD COLUMN created_by_user_id UUID DEFAULT NULL;

-- Criar tabela de pastas
CREATE TABLE IF NOT EXISTS model_media_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id UUID DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by_user_id UUID DEFAULT NULL
);

-- RLS para pastas
ALTER TABLE model_media_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all folders" ON model_media_folders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Models can manage their own folders" ON model_media_folders
  FOR ALL USING (
    model_id IN (
      SELECT model_id FROM model_profiles 
      WHERE user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_model_media_folders_updated_at
  BEFORE UPDATE ON model_media_folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para performance
CREATE INDEX idx_model_media_folders_model_id ON model_media_folders(model_id);
CREATE INDEX idx_model_photos_folder_id ON model_photos(folder_id);
CREATE INDEX idx_model_videos_folder_id ON model_videos(folder_id);
CREATE INDEX idx_model_photos_stage ON model_photos(stage);
CREATE INDEX idx_model_videos_stage ON model_videos(stage);
CREATE INDEX idx_model_photos_tags ON model_photos USING GIN(tags);
CREATE INDEX idx_model_videos_tags ON model_videos USING GIN(tags);