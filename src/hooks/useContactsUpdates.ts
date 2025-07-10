
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ContactUpdate {
  id: string;
  model_id: string;
  model_name: string;
  model_photo: string;
  media_url: string;
  media_type: 'photo' | 'video';
  thumbnail_url?: string;
  created_at: string;
  has_unread: boolean;
}

export interface Contact {
  model_id: string;
  model_name: string;
  model_photo: string;
  last_conversation_at: string;
  updates: ContactUpdate[];
}

export const useContactsUpdates = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['contacts-updates', user?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!user) throw new Error('User not authenticated');

      console.log('Fetching contacts updates for user:', user.id);

      // Buscar modelos com quem o usuário teve conversas
      const { data: conversations, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          model_id,
          last_message_at,
          models (
            id,
            name,
            photos:model_photos!inner (
              photo_url,
              is_primary
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .not('model_id', 'is', null)
        .order('last_message_at', { ascending: false });

      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        throw conversationsError;
      }

      if (!conversations || conversations.length === 0) {
        console.log('No conversations found');
        return [];
      }

      // Processar cada contato para buscar suas atualizações
      const contactsPromises = conversations.map(async (conv) => {
        if (!conv.models || !conv.model_id) return null;

        const model = conv.models;
        const primaryPhoto = model.photos?.find(p => p.is_primary);
        const modelPhoto = primaryPhoto?.photo_url || model.photos?.[0]?.photo_url || '/placeholder.svg';

        // Buscar atualizações recentes do modelo (fotos e vídeos dos últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Buscar fotos recentes
        const { data: recentPhotos } = await supabase
          .from('model_photos')
          .select('*')
          .eq('model_id', conv.model_id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .eq('show_in_gallery', true)
          .order('created_at', { ascending: false })
          .limit(10);

        // Buscar vídeos recentes
        const { data: recentVideos } = await supabase
          .from('model_videos')
          .select('*')
          .eq('model_id', conv.model_id)
          .gte('created_at', sevenDaysAgo.toISOString())
          .eq('is_active', true)
          .eq('show_in_gallery', true)
          .order('created_at', { ascending: false })
          .limit(10);

        // Combinar atualizações
        const updates: ContactUpdate[] = [];

        // Adicionar fotos
        if (recentPhotos) {
          recentPhotos.forEach(photo => {
            updates.push({
              id: `photo-${photo.id}`,
              model_id: conv.model_id!,
              model_name: model.name,
              model_photo: modelPhoto,
              media_url: photo.photo_url,
              media_type: 'photo',
              created_at: photo.created_at,
              has_unread: true // Por simplicidade, considerar todas como não lidas
            });
          });
        }

        // Adicionar vídeos
        if (recentVideos) {
          recentVideos.forEach(video => {
            updates.push({
              id: `video-${video.id}`,
              model_id: conv.model_id!,
              model_name: model.name,
              model_photo: modelPhoto,
              media_url: video.video_url,
              media_type: 'video',
              thumbnail_url: video.thumbnail_url,
              created_at: video.created_at,
              has_unread: true
            });
          });
        }

        // Ordenar atualizações por data
        updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return {
          model_id: conv.model_id,
          model_name: model.name,
          model_photo: modelPhoto,
          last_conversation_at: conv.last_message_at || '',
          updates
        };
      });

      const contacts = await Promise.all(contactsPromises);
      const validContacts = contacts.filter(Boolean) as Contact[];

      console.log('Contacts with updates:', validContacts.length);
      return validContacts;
    },
    enabled: !!user,
  });
};
