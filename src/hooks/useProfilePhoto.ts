import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export const useProfilePhoto = () => {
  const { user } = useAuth();
  const { data: currentUser, refetch } = useCurrentUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const uploadProfilePhoto = async (blob: Blob): Promise<string | null> => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive"
      });
      return null;
    }

    try {
      setIsUploading(true);
      
      // Nome único para o arquivo
      const fileName = `${user.id}/profile-${Date.now()}.jpg`;
      
      // Upload para Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Atualizar no banco de dados
      if (currentUser) {
        const { error: updateError } = await supabase
          .from('system_users')
          .update({ profile_photo_url: publicUrl })
          .eq('id', currentUser.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Atualizar também nos metadados do usuário Auth
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { profile_photo_url: publicUrl }
      });

      if (authUpdateError) {
        console.warn('Error updating auth metadata:', authUpdateError);
      }

      // Refetch user data
      await refetch();

      toast({
        title: "Sucesso",
        description: "Foto de perfil atualizada com sucesso!"
      });

      return publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a foto de perfil",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProfilePhoto = async (): Promise<boolean> => {
    if (!user || !currentUser?.profile_photo_url) {
      return false;
    }

    try {
      setIsUploading(true);

      // Extrair o caminho do arquivo da URL
      const url = new URL(currentUser.profile_photo_url);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      // Deletar do storage
      const { error: deleteError } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (deleteError) {
        console.warn('Error deleting file from storage:', deleteError);
      }

      // Remover URL do banco de dados
      const { error: updateError } = await supabase
        .from('system_users')
        .update({ profile_photo_url: null })
        .eq('id', currentUser.id);

      if (updateError) {
        throw updateError;
      }

      // Atualizar metadados do auth
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: { profile_photo_url: null }
      });

      if (authUpdateError) {
        console.warn('Error updating auth metadata:', authUpdateError);
      }

      // Refetch user data
      await refetch();

      toast({
        title: "Sucesso",
        description: "Foto de perfil removida com sucesso!"
      });

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover a foto de perfil",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadProfilePhoto,
    deleteProfilePhoto,
    isUploading,
    currentPhotoUrl: currentUser?.profile_photo_url || user?.user_metadata?.profile_photo_url
  };
};