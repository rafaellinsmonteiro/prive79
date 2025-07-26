import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePixRequest {
  action: 'create';
  amount: number;
  description?: string;
  customer?: {
    name?: string;
    email?: string;
    cellphone?: string;
    taxId?: string;
  };
  metadata?: {
    externalId?: string;
  };
}

interface StatusPixRequest {
  action: 'status';
  pixId: string;
}

type PixRequest = CreatePixRequest | StatusPixRequest;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const body: PixRequest = await req.json();
    
    // Obter token da API do AbacatePay dos secrets
    const abacatePayToken = Deno.env.get('ABACATEPAY_API_KEY');
    if (!abacatePayToken) {
      console.error('ABACATEPAY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment gateway not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (body.action === 'create') {
      // Validar entrada
      if (!body.amount || body.amount <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid amount' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Validar CPF obrigatório
      if (!body.customer?.taxId || body.customer.taxId === '000.000.000-00') {
        return new Response(
          JSON.stringify({ 
            error: 'CPF obrigatório', 
            message: 'CPF é obrigatório para gerar PIX. Cadastre seu CPF em Minha Conta > Dados Pessoais.'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Criar PIX QR Code
      const pixPayload = {
        amount: Math.round(body.amount * 100), // AbacatePay usa centavos
        expiresIn: 1800, // 30 minutos
        description: body.description || `Depósito PriveBank - R$ ${body.amount.toFixed(2)}`,
        customer: {
          name: body.customer?.name || 'Cliente PriveBank',
          cellphone: body.customer?.cellphone || '(11) 9999-9999',
          email: body.customer?.email || user.email,
          taxId: body.customer?.taxId || '000.000.000-00'
        },
        metadata: {
          externalId: body.metadata?.externalId || `deposit_${user.id}_${Date.now()}`,
          userId: user.id
        }
      };

      console.log('Creating PIX QR Code with payload:', JSON.stringify(pixPayload, null, 2));

      const abacateResponse = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${abacatePayToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pixPayload)
      });

      const abacateData = await abacateResponse.json();
      
      console.log('AbacatePay response:', JSON.stringify(abacateData, null, 2));

      if (!abacateResponse.ok) {
        console.error('AbacatePay API error:', abacateData);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create PIX QR Code',
            details: abacateData.error || 'Unknown error'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (abacateData.data) {
        // Salvar registro do PIX no banco de dados para tracking
        const { error: dbError } = await supabaseClient
          .from('pix_deposits')
          .insert({
            user_id: user.id,
            pix_id: abacateData.data.id,
            amount: body.amount,
            status: abacateData.data.status,
            expires_at: abacateData.data.expiresAt,
            br_code: abacateData.data.brCode
          });

        if (dbError) {
          console.error('Error saving PIX to database:', dbError);
        }

        return new Response(
          JSON.stringify({
            id: abacateData.data.id,
            amount: body.amount,
            status: abacateData.data.status,
            brCode: abacateData.data.brCode,
            brCodeBase64: abacateData.data.brCodeBase64,
            expiresAt: abacateData.data.expiresAt
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid response from payment gateway' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

    } else if (body.action === 'status') {
      // Verificar status do PIX
      const abacateResponse = await fetch(`https://api.abacatepay.com/v1/pixQrCode/${body.pixId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${abacatePayToken}`,
          'Content-Type': 'application/json',
        }
      });

      const abacateData = await abacateResponse.json();

      if (!abacateResponse.ok) {
        console.error('AbacatePay status check error:', abacateData);
        return new Response(
          JSON.stringify({ error: 'Failed to check PIX status' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({
          status: abacateData.data?.status || 'UNKNOWN'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})