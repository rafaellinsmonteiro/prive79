import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPEN_AI_KEY_2');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if OpenAI API key exists
    if (!openAIApiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('OpenAI API key não está configurada. Configure a variável OPENAI_API_KEY no Supabase.');
    }

    const { message, conversationHistory = [] } = await req.json();
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    console.log('Processing message:', message);

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar dados atuais de modelos, categorias e cidades
    const [modelsRes, categoriesRes, citiesRes] = await Promise.all([
      supabase.from('models').select(`
        id, name, age, city, city_id, height, weight, bust, waist, hip, 
        cabelo, olhos, etnia, description, whatsapp_number, is_active,
        "1hora", "2horas", "3horas", pernoite, diaria,
        model_photos:model_photos!inner(photo_url, is_primary)
      `).eq('is_active', true).eq('model_photos.is_primary', true),
      supabase.from('categories').select('id, name').order('display_order'),
      supabase.from('cities').select('id, name, state').eq('is_active', true).order('name')
    ]);

    const models = modelsRes.data || [];
    const categories = categoriesRes.data || [];
    const cities = citiesRes.data || [];

    console.log(`Found ${models.length} models, ${categories.length} categories, ${cities.length} cities`);

    // Prompt especializado para busca de modelos
    const systemPrompt = `Você é um assistente especializado em conectar clientes com modelos/acompanhantes. Sua função é entender as preferências do usuário e encontrar as melhores opções.

DADOS DISPONÍVEIS:
Modelos: ${JSON.stringify(models.slice(0, 10))} (mostrando apenas 10 primeiros como exemplo)
Categorias: ${JSON.stringify(categories)}
Cidades: ${JSON.stringify(cities)}

INSTRUÇÕES:
1. Analise a mensagem do usuário para extrair critérios como: idade, altura, cor de cabelo, cor dos olhos, cidade, disponibilidade, preços, serviços específicos
2. Busque modelos que correspondam aos critérios mencionados
3. Apresente as opções de forma amigável e detalhada
4. Se não houver critérios específicos, faça perguntas para entender melhor as preferências
5. Sempre seja respeitoso e profissional
6. Forneça informações úteis como preços, localização e como entrar em contato

FORMATO DE RESPOSTA:
- Seja conversacional e natural
- Se encontrar modelos, apresente 2-3 opções principais
- Inclua informações relevantes de cada modelo
- Ofereça opções para refinar a busca
- Se necessário, faça perguntas para esclarecer preferências

Responda sempre em português brasileiro.`;

    // Construir histórico da conversa
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Sending request to OpenAI...');

    // Chamar OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('OpenAI response received');

    // Extrair modelos mencionados na resposta (opcional, para uso futuro)
    const extractedModels = models.filter(model => 
      aiResponse.toLowerCase().includes(model.name.toLowerCase())
    ).slice(0, 3);

    return new Response(JSON.stringify({
      response: aiResponse,
      suggestedModels: extractedModels,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});