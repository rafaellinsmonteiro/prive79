import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useCreatePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ modelId, photoUrl, isPrimary = false }: { 
      modelId: string; 
      photoUrl: string; 
      isPrimary?: boolean; 
    }) => {
      console.log('Creating photo:', { modelId, photoUrl, isPrimary });
      
      // Se é para ser primária, primeiro removemos a flag de outras fotos
      if (isPrimary) {
        await supabase
          .from('model_photos')
          .update({ is_primary: false })
          .eq('model_id', modelId);
      }

      const { data, error } = await supabase
        .from('model_photos')
        .insert({
          model_id: modelId,
          photo_url: photoUrl,
          is_primary: isPrimary,
          display_order: 0
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating photo:', error);
        throw error;
      }
      
      console.log('Photo created successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['model-media', variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      modelId, 
      videoUrl, 
      title, 
      thumbnailUrl 
    }: { 
      modelId: string; 
      videoUrl: string; 
      title?: string; 
      thumbnailUrl?: string; 
    }) => {
      console.log('Creating video:', { modelId, videoUrl, title, thumbnailUrl });
      
      const { data, error } = await supabase
        .from('model_videos')
        .insert({
          model_id: modelId,
          video_url: videoUrl,
          title: title || null,
          thumbnail_url: thumbnailUrl || null,
          display_order: 0,
          is_active: true
        })
        .select()
        .maybeSingle();

      if (error) {
        console.error('Error creating video:', error);
        throw error;
      }
      
      console.log('Video created successfully:', data);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['model-media', variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, modelId }: { photoId: string; modelId: string }) => {
      console.log('Deleting photo:', photoId);
      
      const { error } = await supabase
        .from('model_photos')
        .delete()
        .eq('id', photoId);

      if (error) {
        console.error('Error deleting photo:', error);
        throw error;
      }
      
      console.log('Photo deleted successfully');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['model-media', variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ videoId, modelId }: { videoId: string; modelId: string }) => {
      console.log('Deleting video:', videoId);
      
      const { error } = await supabase
        .from('model_videos')
        .delete()
        .eq('id', videoId);

      if (error) {
        console.error('Error deleting video:', error);
        throw error;
      }
      
      console.log('Video deleted successfully');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['model-media', variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useSetPrimaryPhoto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ photoId, modelId }: { photoId: string; modelId: string }) => {
      console.log('Setting primary photo:', photoId);
      
      // Primeiro, remove a flag de primária de todas as fotos
      await supabase
        .from('model_photos')
        .update({ is_primary: false })
        .eq('model_id', modelId);

      // Depois, define a foto selecionada como primária
      const { error } = await supabase
        .from('model_photos')
        .update({ is_primary: true })
        .eq('id', photoId);

      if (error) {
        console.error('Error setting primary photo:', error);
        throw error;
      }
      
      console.log('Primary photo set successfully');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['model-media', variables.modelId] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({ file, modelId, type }: { 
      file: File; 
      modelId: string; 
      type: 'photo' | 'video'; 
    }) => {
      console.log('Uploading file:', file.name, 'for model:', modelId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${modelId}/${Date.now()}.${fileExt}`;
      const bucketName = type === 'photo' ? 'model-photos' : 'model-videos';

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading file:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      console.log('File uploaded successfully:', publicUrl);
      return publicUrl;
    },
  });
};

export const useUpdatePhotoVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      photoId, 
      field, 
      value 
    }: { 
      photoId: string; 
      field: 'show_in_profile' | 'show_in_gallery'; 
      value: boolean; 
    }) => {
      console.log('Updating photo visibility:', { photoId, field, value });
      
      const { error } = await supabase
        .from('model_photos')
        .update({ [field]: value })
        .eq('id', photoId);

      if (error) {
        console.error('Error updating photo visibility:', error);
        throw error;
      }
      
      console.log('Photo visibility updated successfully');
    },
    onSuccess: (_, variables) => {
      // Get modelId from the photo data to invalidate the correct queries
      queryClient.invalidateQueries({ queryKey: ['model-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUpdateVideoVisibility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      videoId, 
      field, 
      value 
    }: { 
      videoId: string; 
      field: 'show_in_profile' | 'show_in_gallery'; 
      value: boolean; 
    }) => {
      console.log('Updating video visibility:', { videoId, field, value });
      
      const { error } = await supabase
        .from('model_videos')
        .update({ [field]: value })
        .eq('id', videoId);

      if (error) {
        console.error('Error updating video visibility:', error);
        throw error;
      }
      
      console.log('Video visibility updated successfully');
    },
    onSuccess: (_, variables) => {
      // Get modelId from the video data to invalidate the correct queries
      queryClient.invalidateQueries({ queryKey: ['model-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUpdatePhotoVisibilitySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      photoId, 
      visibilityType, 
      allowedPlanIds 
    }: { 
      photoId: string; 
      visibilityType: string; 
      allowedPlanIds: string[]; 
    }) => {
      console.log('Updating photo visibility settings:', { photoId, visibilityType, allowedPlanIds });
      
      const { error } = await supabase
        .from('model_photos')
        .update({ 
          visibility_type: visibilityType,
          allowed_plan_ids: allowedPlanIds.length > 0 ? allowedPlanIds : null 
        })
        .eq('id', photoId);

      if (error) {
        console.error('Error updating photo visibility settings:', error);
        throw error;
      }
      
      console.log('Photo visibility settings updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};

export const useUpdateVideoVisibilitySettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      videoId, 
      visibilityType, 
      allowedPlanIds 
    }: { 
      videoId: string; 
      visibilityType: string; 
      allowedPlanIds: string[]; 
    }) => {
      console.log('Updating video visibility settings:', { videoId, visibilityType, allowedPlanIds });
      
      const { error } = await supabase
        .from('model_videos')
        .update({ 
          visibility_type: visibilityType,
          allowed_plan_ids: allowedPlanIds.length > 0 ? allowedPlanIds : null 
        })
        .eq('id', videoId);

      if (error) {
        console.error('Error updating video visibility settings:', error);
        throw error;
      }
      
      console.log('Video visibility settings updated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['model-media'] });
      queryClient.invalidateQueries({ queryKey: ['admin-models'] });
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
  });
};
