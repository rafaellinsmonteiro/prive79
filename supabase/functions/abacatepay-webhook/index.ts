import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Webhook received from AbacatePay');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Webhook payload:', JSON.stringify(body, null, 2));

    // Verificar se é um evento de PIX pago via billing.paid ou direto via pixQrCode
    if (body.event === 'billing.paid' && body.data?.pixQrCode) {
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

    // Outros tipos de webhook
    return new Response(
      JSON.stringify({ message: 'Webhook received but not processed' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Webhook error:', error);
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