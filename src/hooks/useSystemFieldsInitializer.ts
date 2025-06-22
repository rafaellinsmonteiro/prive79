
import { useEffect } from 'react';
import { useCreateCustomField, useCreateCustomSection } from './useCustomFields';

export const useSystemFieldsInitializer = () => {
  const createCustomField = useCreateCustomField();
  const createCustomSection = useCreateCustomSection();

  const systemSections = [
    { name: 'Informações Básicas', display_order: 1, is_active: true },
    { name: 'Características Físicas', display_order: 2, is_active: true },
    { name: 'Outras Informações', display_order: 3, is_active: true },
    { name: 'Configurações', display_order: 4, is_active: true },
    { name: 'Controle de Acesso', display_order: 5, is_active: true },
  ];

  const systemFields = [
    // Informações Básicas
    { field_name: 'name', label: 'Nome', field_type: 'text' as const, is_required: true, section: 'Informações Básicas', display_order: 1, description: 'Nome da modelo' },
    { field_name: 'age', label: 'Idade', field_type: 'number' as const, is_required: true, section: 'Informações Básicas', display_order: 2, description: 'Idade da modelo' },
    { field_name: 'neighborhood', label: 'Bairro', field_type: 'text' as const, is_required: false, section: 'Informações Básicas', display_order: 3, description: 'Bairro onde atende' },
    { field_name: 'whatsapp_number', label: 'WhatsApp', field_type: 'text' as const, is_required: false, section: 'Informações Básicas', display_order: 4, description: 'Número do WhatsApp' },
    
    // Características Físicas
    { field_name: 'height', label: 'Altura', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 5, description: 'Altura da modelo' },
    { field_name: 'weight', label: 'Peso', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 6, description: 'Peso da modelo' },
    { field_name: 'eyes', label: 'Olhos', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 7, description: 'Cor dos olhos' },
    { field_name: 'body_type', label: 'Manequim', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 8, description: 'Tipo de corpo/manequim' },
    { field_name: 'shoe_size', label: 'Calçado', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 9, description: 'Número do sapato' },
    { field_name: 'bust', label: 'Busto', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 10, description: 'Medida do busto' },
    { field_name: 'waist', label: 'Cintura', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 11, description: 'Medida da cintura' },
    { field_name: 'hip', label: 'Quadril', field_type: 'text' as const, is_required: false, section: 'Características Físicas', display_order: 12, description: 'Medida do quadril' },
    
    // Outras Informações
    { field_name: 'languages', label: 'Idiomas', field_type: 'text' as const, is_required: false, section: 'Outras Informações', display_order: 13, description: 'Idiomas falados' },
    { field_name: 'description', label: 'Descrição', field_type: 'textarea' as const, is_required: false, section: 'Outras Informações', display_order: 14, description: 'Descrição detalhada' },
    
    // Configurações
    { field_name: 'silicone', label: 'Silicone', field_type: 'boolean' as const, is_required: false, section: 'Configurações', display_order: 15, description: 'Possui silicone' },
    { field_name: 'is_active', label: 'Perfil Ativo', field_type: 'boolean' as const, is_required: false, section: 'Configurações', display_order: 16, description: 'Se o perfil está ativo' },
    { field_name: 'display_order', label: 'Ordem de Exibição', field_type: 'number' as const, is_required: false, section: 'Configurações', display_order: 17, description: 'Ordem na listagem' },
    
    // Controle de Acesso
    { field_name: 'visibility_type', label: 'Tipo de Visibilidade', field_type: 'select' as const, is_required: false, section: 'Controle de Acesso', display_order: 18, description: 'Controle de visibilidade do perfil', options: ['public', 'restricted', 'private'] },
    { field_name: 'allowed_plan_ids', label: 'Planos Permitidos', field_type: 'select' as const, is_required: false, section: 'Controle de Acesso', display_order: 19, description: 'Planos que podem ver o perfil' },
  ];

  const initializeSystemData = async () => {
    try {
      console.log('🚀 Iniciando criação das seções do sistema...');
      
      // Criar seções do sistema
      for (const section of systemSections) {
        console.log('📁 Criando seção:', section.name);
        try {
          await createCustomSection.mutateAsync(section);
          console.log('✅ Seção criada:', section.name);
        } catch (error) {
          console.error('❌ Erro ao criar seção:', section.name, error);
        }
      }

      console.log('🚀 Iniciando criação dos campos do sistema...');
      
      // Criar campos do sistema
      for (const field of systemFields) {
        console.log('🏷️ Criando campo:', field.field_name);
        try {
          await createCustomField.mutateAsync({
            ...field,
            is_active: true,
            help_text: field.description,
          });
          console.log('✅ Campo criado:', field.field_name);
        } catch (error) {
          console.error('❌ Erro ao criar campo:', field.field_name, error);
        }
      }

      console.log('🎉 Campos e seções do sistema criados com sucesso!');
    } catch (error) {
      console.error('💥 Erro geral ao criar campos e seções do sistema:', error);
    }
  };

  return { initializeSystemData };
};
