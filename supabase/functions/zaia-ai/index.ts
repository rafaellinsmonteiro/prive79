
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const zaiaApiKey = Deno.env.get('ZAIA_AI_API_KEY');
    
    if (!zaiaApiKey) {
      throw new Error('ZAIA_AI_API_KEY não configurada');
    }

    const { message, context, type = 'chat' } = await req.json();

    if (!message) {
      throw new Error('Mensagem é obrigatória');
    }

    console.log('Zaia AI request:', { type, message: message.substring(0, 100) });

    // Configurar endpoint baseado no tipo de requisição
    let endpoint = 'https://api.zaia.ai/v1/chat';
    let requestBody: any = {
      message: message,
      model: 'gpt-3.5-turbo' // Modelo padrão
    };

    if (context) {
      requestBody.context = context;
    }

    switch (type) {
      case 'analysis':
        endpoint = 'https://api.zaia.ai/v1/analyze';
        requestBody.analysis_type = 'content';
        break;
      case 'generation':
        endpoint = 'https://api.zaia.ai/v1/generate';
        requestBody.generation_type = 'text';
        break;
      default:
        // Manter endpoint de chat padrão
        break;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zaiaApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zaia AI API error:', response.status, errorText);
      throw new Error(`Erro da API Zaia: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Zaia AI response received');

    return new Response(JSON.stringify({
      response: data.response || data.result || data.message,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in zaia-ai function:', error);
    return new Response(JSON.stringify({
      response: '',
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
