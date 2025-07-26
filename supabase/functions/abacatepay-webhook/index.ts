import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const timestamp = new Date().toISOString();
  const url = req.url;
  const method = req.method;
  
  console.log(`[${timestamp}] Webhook RECEIVED - Method: ${method}, URL: ${url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${timestamp}] Returning CORS preflight response`);
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log EVERYTHING that arrives
    console.log(`[${timestamp}] Processing webhook request`);
    console.log(`[${timestamp}] Headers:`, Object.fromEntries(req.headers.entries()));
    
    // Try to read body (if any)
    let body = null;
    try {
      const rawBody = await req.text();
      console.log(`[${timestamp}] Raw body:`, rawBody);
      if (rawBody) {
        body = JSON.parse(rawBody);
        console.log(`[${timestamp}] Parsed body:`, JSON.stringify(body, null, 2));
      }
    } catch (bodyError) {
      console.log(`[${timestamp}] Could not parse body:`, bodyError.message);
    }
    
    // Validate webhook secret
    const urlObj = new URL(req.url);
    const webhookSecret = urlObj.searchParams.get('webhookSecret');
    const expectedSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    
    console.log(`[${timestamp}] Webhook secret validation:`, {
      received: webhookSecret ? 'present' : 'missing',
      expected: expectedSecret ? 'configured' : 'not configured',
      match: webhookSecret === expectedSecret
    });
    
    // Validate webhook secret FIRST - without secret validation, return immediately  
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.log(`[${timestamp}] UNAUTHORIZED - Invalid webhook secret`);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook secret' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log(`[${timestamp}] Secret validation PASSED`);
    
    // Return early if no body to process
    if (!body) {
      console.log(`[${timestamp}] No body to process`);
      return new Response(
        JSON.stringify({ 
          message: 'Webhook received but no body',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar se é um evento de PIX pago via billing.paid (formato da documentação oficial)
    console.log(`[${timestamp}] Event type:`, body.event);
    console.log(`[${timestamp}] Data structure:`, Object.keys(body.data || {}));
    
    if (body.event === 'billing.paid' && body.data?.pixQrCode && body.data.pixQrCode.status === 'PAID') {
      const pixId = body.data.pixQrCode.id;
      const status = body.data.pixQrCode.status;
      const amount = body.data.pixQrCode.amount / 100; // AbacatePay envia em centavos
      
      console.log(`[${timestamp}] PIX ${pixId} foi pago. Status: ${status}, Valor: R$ ${amount}`);

      // Buscar o PIX deposit no banco
      const { data: pixDeposit, error: pixError } = await supabase
        .from('pix_deposits')
        .select('*')
        .eq('pix_id', pixId)
        .single();

      if (pixError) {
        console.error('Erro ao buscar PIX deposit:', pixError);
        return new Response(
          JSON.stringify({ error: 'PIX deposit not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      if (pixDeposit.processed) {
        console.log('PIX já foi processado anteriormente');
        return new Response(
          JSON.stringify({ message: 'PIX already processed' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Atualizar o status do PIX deposit
      const { error: updatePixError } = await supabase
        .from('pix_deposits')
        .update({ 
          status: 'PAID', 
          processed: true 
        })
        .eq('pix_id', pixId);

      if (updatePixError) {
        console.error('Erro ao atualizar PIX deposit:', updatePixError);
        return new Response(
          JSON.stringify({ error: 'Failed to update PIX deposit' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Buscar a conta PrivaBank do usuário
      const { data: account, error: accountError } = await supabase
        .from('privabank_accounts')
        .select('*')
        .eq('user_id', pixDeposit.user_id)
        .single();

      if (accountError) {
        console.error('Erro ao buscar conta PrivaBank:', accountError);
        return new Response(
          JSON.stringify({ error: 'PrivaBank account not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Atualizar o saldo em Reais
      const newBalanceBrl = Number(account.balance_brl) + amount;
      const { error: updateBalanceError } = await supabase
        .from('privabank_accounts')
        .update({ balance_brl: newBalanceBrl })
        .eq('id', account.id);

      if (updateBalanceError) {
        console.error('Erro ao atualizar saldo:', updateBalanceError);
        return new Response(
          JSON.stringify({ error: 'Failed to update balance' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Criar transação de depósito PIX
      const { error: transactionError } = await supabase
        .from('privabank_transactions')
        .insert({
          to_account_id: account.id,
          amount: amount,
          transaction_type: 'deposit_pix',
          description: `Depósito PIX - R$ ${amount.toFixed(2)}`,
          status: 'completed',
          currency: 'BRL'
        });

      if (transactionError) {
        console.error('Erro ao criar transação:', transactionError);
        return new Response(
          JSON.stringify({ error: 'Failed to create transaction' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      console.log(`PIX processado com sucesso! Valor R$ ${amount} creditado na conta do usuário ${pixDeposit.user_id}`);

      return new Response(
        JSON.stringify({ 
          message: 'PIX processed successfully',
          amount: amount,
          user_id: pixDeposit.user_id
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Outros tipos de webhook - log para debugging
    console.log('Webhook received but not processed - event type:', body.event);
    console.log('Available data keys:', Object.keys(body.data || {}));
    
    return new Response(
      JSON.stringify({ 
        message: 'Webhook received but not processed',
        event: body.event,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook error details:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})