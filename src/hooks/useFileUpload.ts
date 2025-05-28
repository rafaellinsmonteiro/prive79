
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadPhoto = async (file: File, modelId: string) => {
    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${modelId}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('model-photos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('model-photos')
        .getPublicUrl(fileName);

      // Save photo reference to database
      const { error: dbError } = await supabase
        .from('model_photos')
        .insert({
          model_id: modelId,
          photo_url: publicUrl,
          display_order: 0
        });

      if (dbError) throw dbError;

      return publicUrl;
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const uploadVideo = async (file: File, modelId: string, thumbnailFile?: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${modelId}/${Date.now()}.${fileExt}`;

      // Upload video
      const { data, error } = await supabase.storage
        .from('model-videos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('model-videos')
        .getPublicUrl(fileName);

      let thumbnailUrl = null;

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbExt = thumbnailFile.name.split('.').pop();
        const thumbFileName = `${modelId}/${Date.now()}_thumb.${thumbExt}`;

        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('video-thumbnails')
          .upload(thumbFileName, thumbnailFile);

        if (!thumbError) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from('video-thumbnails')
            .getPublicUrl(thumbFileName);
          thumbnailUrl = thumbUrl;
        }
      }

      // Save video reference to database
      const { error: dbError } = await supabase
        .from('model_videos')
        .insert({
          model_id: modelId,
          video_url: publicUrl,
          thumbnail_url: thumbnailUrl,
          display_order: 0
        });

      if (dbError) throw dbError;

      return { videoUrl: publicUrl, thumbnailUrl };
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return {
    uploadPhoto,
    uploadVideo,
    uploading,
    progress
  };
};
