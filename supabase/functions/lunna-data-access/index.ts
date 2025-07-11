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