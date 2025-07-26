import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

type Contact = Tables<'contacts'> & {
  contact_user_info?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  model_info?: {
    id: string;
    name: string;
    photo_url?: string;
  } | null;
};

export const useContacts = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['contacts', user?.id],
    queryFn: async (): Promise<Contact[]> => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('=== Contacts Query Debug ===');
      console.log('Authenticated user:', { id: user.id, email: user.email });

      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      console.log('Raw contacts:', contacts);

      // Buscar informações dos contatos
      const contactsWithInfo = await Promise.all(
        contacts.map(async (contact) => {
          let contactInfo: Contact = { ...contact };

          // Se for um modelo, buscar info da tabela models
          if (contact.is_model && contact.model_id) {
            const { data: modelData } = await supabase
              .from('models')
              .select('id, name')
              .eq('id', contact.model_id)
              .single();

            if (modelData) {
              // Buscar foto principal do modelo
              const { data: photoData } = await supabase
                .from('model_photos')
                .select('photo_url')
                .eq('model_id', contact.model_id)
                .eq('is_primary', true)
                .single();

              contactInfo.model_info = {
                id: modelData.id,
                name: modelData.name,
                photo_url: photoData?.photo_url
              };
            }
          }

          // Buscar info do usuário na tabela system_users
          const { data: userData } = await supabase
            .from('system_users')
            .select('id, name, email')
            .eq('user_id', contact.contact_user_id)
            .single();

          if (userData) {
            contactInfo.contact_user_info = userData;
          }

          return contactInfo;
        })
      );

      console.log('Contacts with info:', contactsWithInfo);
      return contactsWithInfo;
    },
    enabled: !!user,
  });
};

export const useAddContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chatUserId: string): Promise<Contact> => {
      if (!user) throw new Error('User not authenticated');

      console.log('=== Add Contact Debug ===');
      console.log('Current user:', user.id);
      console.log('Adding contact with chat_user_id:', chatUserId);

      // 1. Buscar o chat_user para obter o user_id
      const { data: chatUser, error: chatUserError } = await supabase
        .from('chat_users')
        .select('user_id, chat_display_name')
        .eq('id', chatUserId)
        .single();

      if (chatUserError || !chatUser) {
        console.error('Chat user not found:', chatUserError);
        throw new Error('ID de chat não encontrado. Verifique se o ID está correto.');
      }

      console.log('Found chat user:', chatUser);

      // 2. Verificar se é um modelo para obter model_id
      const { data: modelProfile } = await supabase
        .from('model_profiles')
        .select('model_id')
        .eq('user_id', chatUser.user_id)
        .eq('is_active', true)
        .single();

      const isModel = !!modelProfile;
      const modelId = modelProfile?.model_id || null;

      console.log('Is model:', isModel, 'Model ID:', modelId);

      // 3. Buscar informações do usuário
      const { data: userInfo } = await supabase
        .from('system_users')
        .select('name, email')
        .eq('user_id', chatUser.user_id)
        .single();

      // 4. Se for modelo, buscar nome do modelo
      let contactName = userInfo?.name || chatUser.chat_display_name || 'Contato';
      
      if (isModel && modelId) {
        const { data: modelData } = await supabase
          .from('models')
          .select('name')
          .eq('id', modelId)
          .single();
        
        if (modelData) {
          contactName = modelData.name;
        }
      }

      // 5. Buscar foto se for modelo
      let contactPhotoUrl = null;
      if (isModel && modelId) {
        const { data: photoData } = await supabase
          .from('model_photos')
          .select('photo_url')
          .eq('model_id', modelId)
          .eq('is_primary', true)
          .single();
        
        contactPhotoUrl = photoData?.photo_url || null;
      }

      // 6. Criar o contato
      const contactData: TablesInsert<'contacts'> = {
        user_id: user.id,
        contact_user_id: chatUser.user_id,
        contact_chat_id: chatUserId,
        contact_name: contactName,
        contact_photo_url: contactPhotoUrl,
        is_model: isModel,
        model_id: modelId,
        added_automatically: false
      };

      console.log('Creating contact with data:', contactData);

      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Este contato já existe na sua lista');
        }
        throw new Error('Erro ao adicionar contato: ' + error.message);
      }

      console.log('Contact created successfully:', newContact);
      return newContact;
    },
    onSuccess: (newContact) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success(`Contato ${newContact.contact_name} adicionado com sucesso!`);
    },
    onError: (error: any) => {
      console.error('Add contact error:', error);
      toast.error(error.message || 'Erro ao adicionar contato');
    },
  });
};

export const useAutoAddContact = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ contactUserId, modelId }: { contactUserId: string; modelId?: string }): Promise<void> => {
      if (!user) throw new Error('User not authenticated');

      console.log('=== Auto Add Contact Debug ===');
      console.log('Current user:', user.id);
      console.log('Contact user ID:', contactUserId);
      console.log('Model ID:', modelId);

      // Verificar se já existe este contato
      const { data: existingContact } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', user.id)
        .eq('contact_user_id', contactUserId)
        .single();

      if (existingContact) {
        console.log('Contact already exists, skipping auto-add');
        return;
      }

      // Buscar chat_user_id
      const { data: chatUser } = await supabase
        .from('chat_users')
        .select('id, chat_display_name')
        .eq('user_id', contactUserId)
        .single();

      if (!chatUser) {
        console.log('Chat user not found for auto-add');
        return;
      }

      // Buscar informações do usuário
      const { data: userInfo } = await supabase
        .from('system_users')
        .select('name, email')
        .eq('user_id', contactUserId)
        .single();

      // Determinar se é modelo
      const isModel = !!modelId;
      let contactName = userInfo?.name || chatUser.chat_display_name || 'Contato';
      let contactPhotoUrl = null;

      if (isModel && modelId) {
        // Buscar nome do modelo
        const { data: modelData } = await supabase
          .from('models')
          .select('name')
          .eq('id', modelId)
          .single();
        
        if (modelData) {
          contactName = modelData.name;
        }

        // Buscar foto do modelo
        const { data: photoData } = await supabase
          .from('model_photos')
          .select('photo_url')
          .eq('model_id', modelId)
          .eq('is_primary', true)
          .single();
        
        contactPhotoUrl = photoData?.photo_url || null;
      }

      // Criar o contato automaticamente
      const contactData: TablesInsert<'contacts'> = {
        user_id: user.id,
        contact_user_id: contactUserId,
        contact_chat_id: chatUser.id,
        contact_name: contactName,
        contact_photo_url: contactPhotoUrl,
        is_model: isModel,
        model_id: modelId || null,
        added_automatically: true
      };

      console.log('Auto-creating contact with data:', contactData);

      const { error } = await supabase
        .from('contacts')
        .insert(contactData);

      if (error && error.code !== '23505') { // Ignorar se já existe
        console.error('Error auto-creating contact:', error);
        throw error;
      }

      console.log('Contact auto-created successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (error: any) => {
      console.error('Auto add contact error:', error);
      // Não mostrar toast de erro para auto-add
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success('Contato removido com sucesso!');
    },
    onError: (error: any) => {
      console.error('Delete contact error:', error);
      toast.error('Erro ao remover contato');
    },
  });
};