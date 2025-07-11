import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { action, filters = {} } = await req.json()

    console.log('🌙 Lunna solicitou:', action, 'com filtros:', filters)

    let result = {}

    switch (action) {
      case 'buscar_modelos':
        const { data: models } = await supabase
          .from('models')
          .select(`
            id,
            name,
            age,
            description,
            city,
            neighborhood,
            height,
            weight,
            body_type,
            etnia,
            cabelo,
            olhos,
            languages,
            "1hora",
            "2horas",
            "3horas",
            pernoite,
            diaria,
            whatsapp_number,
            is_active,
            cities(name),
            model_categories(categories(name)),
            model_photos(photo_url, is_primary)
          `)
          .eq('is_active', true)
          .limit(filters.limit || 10)

        result = {
          modelos: models?.map(model => ({
            id: model.id,
            nome: model.name,
            idade: model.age,
            descricao: model.description,
            cidade: model.cities?.name || model.city,
            bairro: model.neighborhood,
            altura: model.height,
            peso: model.weight,
            tipo_corpo: model.body_type,
            etnia: model.etnia,
            cabelo: model.cabelo,
            olhos: model.olhos,
            idiomas: model.languages,
            preco_1h: model["1hora"],
            preco_2h: model["2horas"],
            preco_3h: model["3horas"],
            pernoite: model.pernoite,
            diaria: model.diaria,
            whatsapp: model.whatsapp_number,
            categorias: model.model_categories?.map(mc => mc.categories?.name) || [],
            foto_principal: model.model_photos?.find(p => p.is_primary)?.photo_url
          })) || []
        }
        break

      case 'buscar_cidades':
        const { data: cities } = await supabase
          .from('cities')
          .select('id, name, state')
          .eq('is_active', true)
          .order('name')

        result = {
          cidades: cities?.map(city => ({
            id: city.id,
            nome: city.name,
            estado: city.state
          })) || []
        }
        break

      case 'buscar_categorias':
        const { data: categories } = await supabase
          .from('categories')
          .select('id, name')
          .order('display_order')

        result = {
          categorias: categories?.map(cat => ({
            id: cat.id,
            nome: cat.name
          })) || []
        }
        break

      case 'buscar_modelo_por_id':
        if (!filters.modelo_id) {
          throw new Error('ID do modelo é obrigatório')
        }

        const { data: modelDetail } = await supabase
          .from('models')
          .select(`
            *,
            cities(name),
            model_categories(categories(name)),
            model_photos(photo_url, is_primary, display_order),
            services(id, name, description, price, duration)
          `)
          .eq('id', filters.modelo_id)
          .eq('is_active', true)
          .single()

        if (modelDetail) {
          result = {
            modelo: {
              id: modelDetail.id,
              nome: modelDetail.name,
              idade: modelDetail.age,
              descricao: modelDetail.description,
              cidade: modelDetail.cities?.name || modelDetail.city,
              bairro: modelDetail.neighborhood,
              altura: modelDetail.height,
              peso: modelDetail.weight,
              tipo_corpo: modelDetail.body_type,
              etnia: modelDetail.etnia,
              cabelo: modelDetail.cabelo,
              olhos: modelDetail.olhos,
              idiomas: modelDetail.languages,
              preco_1h: modelDetail["1hora"],
              preco_2h: modelDetail["2horas"],
              preco_3h: modelDetail["3horas"],
              pernoite: modelDetail.pernoite,
              diaria: modelDetail.diaria,
              whatsapp: modelDetail.whatsapp_number,
              categorias: modelDetail.model_categories?.map(mc => mc.categories?.name) || [],
              fotos: modelDetail.model_photos?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
                .map(p => p.photo_url) || [],
              servicos: modelDetail.services?.map(s => ({
                id: s.id,
                nome: s.name,
                descricao: s.description,
                preco: s.price,
                duracao: s.duration
              })) || [],
              // Serviços disponíveis baseados nos campos boolean
              servicos_disponiveis: {
                anal: modelDetail.anal,
                oral: modelDetail.oral2,
                vaginal: modelDetail.vaginal2,
                beijo: modelDetail.beijo,
                nuru: modelDetail.nuru,
                garganta_profunda: modelDetail.garganta,
                dupla_penetracao: modelDetail.dupla_penetracao,
                videochamada: modelDetail.videochamada,
                grava: modelDetail.grava,
                domicilio: modelDetail.domicilio,
                com_local: modelDetail.com_local,
                motel: modelDetail.motel,
                hotel: modelDetail.hotel,
                jantar: modelDetail.jantar,
                despedida_solteiro: modelDetail.despedida_solteiro,
                clube_swing: modelDetail.clube_swing,
                telegram: modelDetail.telegram,
                onlyfans: modelDetail.onlyfans
              }
            }
          }
        }
        break

      case 'buscar_modelos_por_cidade':
        if (!filters.cidade_nome) {
          throw new Error('Nome da cidade é obrigatório')
        }

        const { data: modelsByCity } = await supabase
          .from('models')
          .select(`
            id,
            name,
            age,
            description,
            neighborhood,
            "1hora",
            whatsapp_number,
            model_photos(photo_url, is_primary)
          `)
          .ilike('city', `%${filters.cidade_nome}%`)
          .eq('is_active', true)
          .limit(filters.limit || 10)

        result = {
          modelos: modelsByCity?.map(model => ({
            id: model.id,
            nome: model.name,
            idade: model.age,
            descricao: model.description,
            bairro: model.neighborhood,
            preco_1h: model["1hora"],
            whatsapp: model.whatsapp_number,
            foto_principal: model.model_photos?.find(p => p.is_primary)?.photo_url
          })) || []
        }
        break

      case 'estatisticas_sistema':
        const [modelsCount, citiesCount, categoriesCount] = await Promise.all([
          supabase.from('models').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('cities').select('id', { count: 'exact' }).eq('is_active', true),
          supabase.from('categories').select('id', { count: 'exact' })
        ])

        result = {
          estatisticas: {
            total_modelos: modelsCount.count || 0,
            total_cidades: citiesCount.count || 0,
            total_categorias: categoriesCount.count || 0
          }
        }
        break

      case 'salvar_preferencias_usuario':
        if (!filters.user_session_id) {
          throw new Error('ID da sessão do usuário é obrigatório')
        }

        const { data: existingUser } = await supabase
          .from('lunna_user_preferences')
          .select('*')
          .eq('user_session_id', filters.user_session_id)
          .single()

        if (existingUser) {
          // Atualizar usuário existente
          const updateData = {
            ...filters,
            interaction_count: existingUser.interaction_count + 1,
            last_interaction_at: new Date().toISOString()
          }
          delete updateData.user_session_id // Não atualizar o ID da sessão

          const { data: updatedUser } = await supabase
            .from('lunna_user_preferences')
            .update(updateData)
            .eq('user_session_id', filters.user_session_id)
            .select()
            .single()

          result = { usuario: updatedUser }
        } else {
          // Criar novo usuário
          const { data: newUser } = await supabase
            .from('lunna_user_preferences')
            .insert({
              user_session_id: filters.user_session_id,
              user_name: filters.user_name,
              preferred_cities: filters.preferred_cities,
              preferred_age_range: filters.preferred_age_range,
              preferred_price_range: filters.preferred_price_range,
              preferred_services: filters.preferred_services,
              notes: filters.notes
            })
            .select()
            .single()

          result = { usuario: newUser }
        }
        break

      case 'buscar_preferencias_usuario':
        if (!filters.user_session_id) {
          throw new Error('ID da sessão do usuário é obrigatório')
        }

        const { data: userPreferences } = await supabase
          .from('lunna_user_preferences')
          .select('*')
          .eq('user_session_id', filters.user_session_id)
          .single()

        result = { 
          usuario: userPreferences || null,
          existe: !!userPreferences
        }
        break

      // === FUNCIONALIDADES ADMINISTRATIVAS ===

      case 'listar_agendamentos':
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            *,
            models:model_id(name, age, city),
            clients:client_id(name, phone, email),
            services:service_id(name, price, duration)
          `)
          .order('appointment_date', { ascending: false })
          .limit(filters.limit || 20);

        if (appointmentsError) throw appointmentsError;

        result = { 
          agendamentos: appointments?.map(apt => ({
            id: apt.id,
            data: apt.appointment_date,
            horario: apt.appointment_time,
            status: apt.status,
            modelo: apt.models?.name,
            cliente: apt.clients?.name,
            servico: apt.services?.name,
            preco: apt.price,
            duracao: apt.duration,
            observacoes: apt.observations
          })) || []
        };
        break;

      case 'criar_agendamento':
        const { data: newAppointment, error: createAppointmentError } = await supabase
          .from('appointments')
          .insert({
            model_id: filters.model_id,
            client_id: filters.client_id,
            service_id: filters.service_id,
            appointment_date: filters.appointment_date,
            appointment_time: filters.appointment_time,
            duration: filters.duration || 60,
            price: filters.price,
            status: filters.status || 'pending',
            observations: filters.observations,
            created_by_admin: true
          })
          .select()
          .single();

        if (createAppointmentError) throw createAppointmentError;

        result = { agendamento: newAppointment, mensagem: 'Agendamento criado com sucesso' };
        break;

      case 'atualizar_agendamento':
        const { data: updatedAppointment, error: updateAppointmentError } = await supabase
          .from('appointments')
          .update({
            appointment_date: filters.appointment_date,
            appointment_time: filters.appointment_time,
            status: filters.status,
            observations: filters.observations,
            price: filters.price
          })
          .eq('id', filters.appointment_id)
          .select()
          .single();

        if (updateAppointmentError) throw updateAppointmentError;

        result = { agendamento: updatedAppointment, mensagem: 'Agendamento atualizado com sucesso' };
        break;

      case 'deletar_agendamento':
        const { error: deleteAppointmentError } = await supabase
          .from('appointments')
          .delete()
          .eq('id', filters.appointment_id);

        if (deleteAppointmentError) throw deleteAppointmentError;

        result = { mensagem: 'Agendamento deletado com sucesso' };
        break;

      case 'listar_modelos_admin':
        const { data: adminModels, error: adminModelsError } = await supabase
          .from('models')
          .select(`
            *,
            model_photos(photo_url, is_primary),
            cities:city_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(filters.limit || 20);

        if (adminModelsError) throw adminModelsError;

        result = { 
          modelos: adminModels?.map(model => ({
            id: model.id,
            nome: model.name,
            idade: model.age,
            cidade: model.cities?.name || model.city,
            ativo: model.is_active,
            whatsapp: model.whatsapp_number,
            preco_1h: model['1hora'],
            descricao: model.description,
            foto_principal: model.model_photos?.find(p => p.is_primary)?.photo_url
          })) || []
        };
        break;

      case 'criar_modelo':
        const { data: newModel, error: createModelError } = await supabase
          .from('models')
          .insert({
            name: filters.name,
            age: filters.age,
            city: filters.city,
            city_id: filters.city_id,
            whatsapp_number: filters.whatsapp_number,
            description: filters.description,
            '1hora': filters.preco_1h,
            is_active: filters.is_active !== false
          })
          .select()
          .single();

        if (createModelError) throw createModelError;

        result = { modelo: newModel, mensagem: 'Modelo criada com sucesso' };
        break;

      case 'atualizar_modelo':
        const { data: updatedModel, error: updateModelError } = await supabase
          .from('models')
          .update({
            name: filters.name,
            age: filters.age,
            city: filters.city,
            whatsapp_number: filters.whatsapp_number,
            description: filters.description,
            '1hora': filters.preco_1h,
            is_active: filters.is_active
          })
          .eq('id', filters.model_id)
          .select()
          .single();

        if (updateModelError) throw updateModelError;

        result = { modelo: updatedModel, mensagem: 'Modelo atualizada com sucesso' };
        break;

      case 'deletar_modelo':
        const { error: deleteModelError } = await supabase
          .from('models')
          .delete()
          .eq('id', filters.model_id);

        if (deleteModelError) throw deleteModelError;

        result = { mensagem: 'Modelo deletada com sucesso' };
        break;

      case 'listar_usuarios':
        const { data: systemUsers, error: usersError } = await supabase
          .from('system_users')
          .select(`
            *,
            plans:plan_id(name, description)
          `)
          .order('created_at', { ascending: false })
          .limit(filters.limit || 20);

        if (usersError) throw usersError;

        result = { 
          usuarios: systemUsers?.map(user => ({
            id: user.id,
            nome: user.name,
            email: user.email,
            telefone: user.phone,
            role: user.user_role,
            plano: user.plans?.name,
            ativo: user.is_active,
            criado_em: user.created_at
          })) || []
        };
        break;

      case 'criar_usuario':
        const { data: newUser, error: createUserError } = await supabase
          .from('system_users')
          .insert({
            name: filters.name,
            email: filters.email,
            phone: filters.phone,
            user_role: filters.user_role || 'cliente',
            plan_id: filters.plan_id,
            is_active: filters.is_active !== false
          })
          .select()
          .single();

        if (createUserError) throw createUserError;

        result = { usuario: newUser, mensagem: 'Usuário criado com sucesso' };
        break;

      case 'atualizar_usuario':
        const { data: updatedSystemUser, error: updateUserError } = await supabase
          .from('system_users')
          .update({
            name: filters.name,
            phone: filters.phone,
            user_role: filters.user_role,
            plan_id: filters.plan_id,
            is_active: filters.is_active
          })
          .eq('id', filters.user_id)
          .select()
          .single();

        if (updateUserError) throw updateUserError;

        result = { usuario: updatedSystemUser, mensagem: 'Usuário atualizado com sucesso' };
        break;

      case 'deletar_usuario':
        const { error: deleteUserError } = await supabase
          .from('system_users')
          .delete()
          .eq('id', filters.user_id);

        if (deleteUserError) throw deleteUserError;

        result = { mensagem: 'Usuário deletado com sucesso' };
        break;

      case 'listar_metas':
        const { data: goals, error: goalsError } = await supabase
          .from('goals')
          .select(`
            *,
            models:model_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(filters.limit || 20);

        if (goalsError) throw goalsError;

        result = { 
          metas: goals?.map(goal => ({
            id: goal.id,
            titulo: goal.title,
            descricao: goal.description,
            tipo: goal.goal_type,
            valor_alvo: goal.target_value,
            valor_atual: goal.current_value,
            periodo: goal.period_type,
            inicio: goal.period_start,
            fim: goal.period_end,
            modelo: goal.models?.name,
            ativo: goal.is_active,
            admin_defined: goal.admin_defined
          })) || []
        };
        break;

      case 'criar_meta':
        const { data: newGoal, error: createGoalError } = await supabase
          .from('goals')
          .insert({
            title: filters.title,
            description: filters.description,
            goal_type: filters.goal_type,
            target_value: filters.target_value,
            period_type: filters.period_type || 'monthly',
            period_start: filters.period_start,
            period_end: filters.period_end,
            model_id: filters.model_id,
            admin_defined: true,
            is_active: filters.is_active !== false
          })
          .select()
          .single();

        if (createGoalError) throw createGoalError;

        result = { meta: newGoal, mensagem: 'Meta criada com sucesso' };
        break;

      case 'atualizar_meta':
        const { data: updatedGoal, error: updateGoalError } = await supabase
          .from('goals')
          .update({
            title: filters.title,
            description: filters.description,
            target_value: filters.target_value,
            period_start: filters.period_start,
            period_end: filters.period_end,
            is_active: filters.is_active
          })
          .eq('id', filters.goal_id)
          .select()
          .single();

        if (updateGoalError) throw updateGoalError;

        result = { meta: updatedGoal, mensagem: 'Meta atualizada com sucesso' };
        break;

      case 'deletar_meta':
        const { error: deleteGoalError } = await supabase
          .from('goals')
          .delete()
          .eq('id', filters.goal_id);

        if (deleteGoalError) throw deleteGoalError;

        result = { mensagem: 'Meta deletada com sucesso' };
        break;

      case 'listar_campos_customizados':
        const { data: customFields, error: fieldsError } = await supabase
          .from('custom_fields')
          .select('*')
          .order('display_order', { ascending: true });

        if (fieldsError) throw fieldsError;

        result = { 
          campos: customFields?.map(field => ({
            id: field.id,
            nome: field.field_name,
            label: field.label,
            tipo: field.field_type,
            secao: field.section,
            obrigatorio: field.is_required,
            ativo: field.is_active,
            opcoes: field.options,
            placeholder: field.placeholder,
            ordem: field.display_order
          })) || []
        };
        break;

      case 'criar_campo_customizado':
        const { data: newField, error: createFieldError } = await supabase
          .from('custom_fields')
          .insert({
            field_name: filters.field_name,
            label: filters.label,
            field_type: filters.field_type,
            section: filters.section,
            is_required: filters.is_required || false,
            is_active: filters.is_active !== false,
            options: filters.options,
            placeholder: filters.placeholder,
            display_order: filters.display_order || 0
          })
          .select()
          .single();

        if (createFieldError) throw createFieldError;

        result = { campo: newField, mensagem: 'Campo customizado criado com sucesso' };
        break;

      case 'atualizar_campo_customizado':
        const { data: updatedField, error: updateFieldError } = await supabase
          .from('custom_fields')
          .update({
            label: filters.label,
            section: filters.section,
            is_required: filters.is_required,
            is_active: filters.is_active,
            options: filters.options,
            placeholder: filters.placeholder
          })
          .eq('id', filters.field_id)
          .select()
          .single();

        if (updateFieldError) throw updateFieldError;

        result = { campo: updatedField, mensagem: 'Campo customizado atualizado com sucesso' };
        break;

      case 'deletar_campo_customizado':
        const { error: deleteFieldError } = await supabase
          .from('custom_fields')
          .delete()
          .eq('id', filters.field_id);

        if (deleteFieldError) throw deleteFieldError;

        result = { mensagem: 'Campo customizado deletado com sucesso' };
        break;

      default:
        throw new Error(`Ação '${action}' não reconhecida`)
    }

    console.log('🌙 Resposta enviada para Lunna:', result)

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('🌙 Erro na função lunna-data-access:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})