import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  userId: string;
  message: string;
  type: 'notification' | 'chat_mirror';
  notificationData?: {
    type: string;
    title: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, message, type, notificationData }: SendMessageRequest = await req.json();

    if (!evolutionApiUrl || !evolutionApiKey) {
      throw new Error('Evolution API not configured');
    }

    // Buscar conexão WhatsApp do usuário
    const { data: connection, error: connectionError } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_connected', true)
      .single();

    if (connectionError || !connection) {
      console.log('❌ No active WhatsApp connection for user:', userId);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No active WhatsApp connection' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Formatar mensagem baseado no tipo
    let finalMessage = message;
    if (type === 'notification' && notificationData) {
      finalMessage = `*${notificationData.title}*\n\n${message}`;
    }

    // Enviar mensagem via Evolution API
    const response = await fetch(`${evolutionApiUrl}/message/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: `${connection.phone_number}@s.whatsapp.net`,
        text: finalMessage
      })
    });

    if (!response.ok) {
      throw new Error(`Evolution API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Message sent via WhatsApp:', result);

    // Se for notificação, registrar no banco
    if (type === 'notification' && notificationData) {
      await supabase
        .from('whatsapp_notifications')
        .insert({
          user_id: userId,
          notification_type: notificationData.type,
          title: notificationData.title,
          message: message,
          status: 'sent',
          sent_at: new Date().toISOString(),
          whatsapp_message_id: result.key?.id
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: result.key?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ WhatsApp sender error:', error);
    
    // Se for notificação, marcar como falha
    const body = await req.clone().json().catch(() => ({}));
    if (body.type === 'notification' && body.notificationData) {
      await supabase
        .from('whatsapp_notifications')
        .insert({
          user_id: body.userId,
          notification_type: body.notificationData.type,
          title: body.notificationData.title,
          message: body.message,
          status: 'failed',
          error_message: error.message
        });
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});