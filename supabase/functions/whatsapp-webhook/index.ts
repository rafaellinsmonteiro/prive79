import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log('📱 WhatsApp Webhook received:', JSON.stringify(webhook, null, 2));

    // Processar mensagens recebidas
    if (webhook.event === 'messages.upsert') {
      await processIncomingMessage(webhook);
    }

    // Processar mudanças de status de conexão
    if (webhook.event === 'connection.update') {
      await processConnectionUpdate(webhook);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ WhatsApp Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processIncomingMessage(webhook: any) {
  const message = webhook.data?.messages?.[0];
  if (!message || message.fromMe) return;

  const phoneNumber = message.key.remoteJid.replace('@s.whatsapp.net', '');
  console.log('📞 Processing message from:', phoneNumber);

  // Buscar conexão WhatsApp do usuário
  const { data: connection } = await supabase
    .from('whatsapp_connections')
    .select('user_id')
    .eq('phone_number', phoneNumber)
    .eq('is_connected', true)
    .single();

  if (!connection) {
    console.log('❌ No connection found for phone:', phoneNumber);
    return;
  }

  const messageText = message.message?.conversation || 
                     message.message?.extendedTextMessage?.text ||
                     '[Mídia não suportada]';

  // Verificar se usuário tem acesso ao chat inteligente
  const { data: userPlan } = await supabase
    .from('system_users')
    .select(`
      *,
      plans!inner(*)
    `)
    .eq('user_id', connection.user_id)
    .single();

  // Se tem acesso ao chat inteligente, processar com IA
  if (userPlan && shouldUseAI(userPlan.plans)) {
    await processAIChat(connection.user_id, messageText, phoneNumber);
  } else {
    // Espelhar no chat interno se existir conversa ativa
    await mirrorToInternalChat(connection.user_id, messageText);
  }
}

async function processAIChat(userId: string, messageText: string, phoneNumber: string) {
  console.log('🤖 Processing AI chat for user:', userId);
  
  try {
    // Chamar função de chat inteligente existente
    const { data, error } = await supabase.functions.invoke('zaia-ai', {
      body: {
        message: messageText,
        userId: userId,
        source: 'whatsapp'
      }
    });

    if (error) throw error;

    // Enviar resposta via WhatsApp
    await sendWhatsAppMessage(phoneNumber, data.response);

  } catch (error) {
    console.error('❌ AI chat error:', error);
    await sendWhatsAppMessage(phoneNumber, 'Desculpe, ocorreu um erro. Tente novamente.');
  }
}

async function mirrorToInternalChat(userId: string, messageText: string) {
  console.log('🔄 Mirroring to internal chat for user:', userId);
  
  // Buscar conversa ativa ou criar uma genérica
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false })
    .limit(1);

  let conversationId = conversations?.[0]?.id;

  if (!conversationId) {
    // Criar conversa genérica para mensagens WhatsApp
    const { data: newConversation } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        model_id: null // Conversa genérica
      })
      .select()
      .single();
    
    conversationId = newConversation?.id;
  }

  if (conversationId) {
    // Inserir mensagem no chat interno
    await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        sender_type: 'user',
        content: messageText,
        message_type: 'text',
        source: 'whatsapp'
      });
  }
}

async function processConnectionUpdate(webhook: any) {
  const { instance, state } = webhook.data;
  console.log('🔗 Connection update:', instance, state);

  if (state === 'open') {
    // Marcar conexão como ativa
    await supabase
      .from('whatsapp_connections')
      .update({ 
        is_connected: true,
        last_activity_at: new Date().toISOString()
      })
      .eq('instance_id', instance);
  } else if (state === 'close') {
    // Marcar conexão como inativa
    await supabase
      .from('whatsapp_connections')
      .update({ is_connected: false })
      .eq('instance_id', instance);
  }
}

async function sendWhatsAppMessage(phoneNumber: string, message: string) {
  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

  if (!evolutionApiUrl || !evolutionApiKey) {
    console.error('❌ Evolution API not configured');
    return;
  }

  try {
    const response = await fetch(`${evolutionApiUrl}/message/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: `${phoneNumber}@s.whatsapp.net`,
        text: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log('✅ WhatsApp message sent successfully');
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error);
  }
}

function shouldUseAI(plan: any): boolean {
  // Verificar se o plano tem acesso ao chat inteligente
  // Você pode ajustar essa lógica conforme seus planos
  return plan?.name !== 'Demo';
}