import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('OpenAI Chat function called');
    
    const openAIApiKey = Deno.env.get('OPEN_AI_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log('Environment check:', {
      hasOpenAI: !!openAIApiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    });

    if (!openAIApiKey) {
      throw new Error('OPEN_AI_KEY não configurada');
    }

    const body = await req.json();
    const { message, conversationHistory = [] } = body;
    
    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    console.log('Processing message:', message);

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    // Buscar modelos
    const { data: models, error: modelsError } = await supabase
      .from('models')
      .select(`
        id, name, age, city, height, weight, 
        cabelo, olhos, etnia, description, 
        "1hora", "2horas", "3horas", pernoite, diaria
      `)
      .eq('is_active', true)
      .limit(10);

    if (modelsError) {
      console.error('Error fetching models:', modelsError);
      throw new Error('Erro ao buscar modelos');
    }

    console.log(`Found ${models?.length || 0} models`);

    // Prompt para IA
    const systemPrompt = `Você é um assistente especializado em conectar clientes com modelos/acompanhantes.

MODELOS DISPONÍVEIS:
${JSON.stringify(models, null, 2)}

INSTRUÇÕES:
1. Analise a mensagem do usuário para extrair critérios como altura, idade, cor de cabelo, cidade, preços, etc.
2. Busque nas modelos disponíveis aquelas que melhor correspondem aos critérios
3. Apresente 2-3 opções principais de forma amigável e detalhada
4. Inclua informações relevantes como preços e características
5. Seja respeitoso e profissional
6. Responda sempre em português brasileiro

Se o usuário não fornecer critérios específicos, faça perguntas para entender melhor suas preferências.`;

    // Construir mensagens para OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    console.log('Calling OpenAI API...');

    // Chamar OpenAI com retry logic
    let response;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
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

        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        if (response.status === 429) {
          console.log(`Rate limit hit, retry ${retryCount + 1}/${maxRetries + 1}`);
          if (retryCount < maxRetries) {
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            retryCount++;
            continue;
          } else {
            throw new Error('Rate limit exceeded. Tente novamente em alguns minutos.');
          }
        }
        
        // Other HTTP errors
        const errorText = await response.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
        
      } catch (error) {
        if (retryCount >= maxRetries) {
          throw error;
        }
        retryCount++;
        console.log(`Request failed, retry ${retryCount}/${maxRetries + 1}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    // Tentar extrair modelos mencionados na resposta
    const mentionedModels = models?.filter(model => 
      aiResponse.toLowerCase().includes(model.name.toLowerCase())
    ).slice(0, 3) || [];

    return new Response(JSON.stringify({
      response: aiResponse,
      suggestedModels: mentionedModels,
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