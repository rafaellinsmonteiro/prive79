import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log(`Received ${req.method} request to: ${req.url}`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Returning CORS preflight response');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook received from AbacatePay');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Validar o secret do webhook
    const url = new URL(req.url);
    const webhookSecret = url.searchParams.get('webhookSecret');
    const expectedSecret = Deno.env.get('ABACATEPAY_WEBHOOK_SECRET');
    
    console.log('Webhook secret from URL:', webhookSecret ? 'present' : 'missing');
    console.log('Expected secret configured:', expectedSecret ? 'yes' : 'no');
    
    if (!webhookSecret || webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret. Received:', webhookSecret, 'Expected:', expectedSecret);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook secret' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    console.log('Webhook secret validation passed');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Verificar se é um evento de PIX pago via billing.paid
    if (body.event === 'billing.paid' && body.data?.pixQrCode && body.data.pixQrCode.status === 'PAID') {
      const pixId = body.data.pixQrCode.id;
      const status = body.data.pixQrCode.status;
      const amount = body.data.pixQrCode.amount / 100; // AbacatePay envia em centavos
      
      console.log(`PIX ${pixId} foi pago. Status: ${status}, Valor: R$ ${amount}`);

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