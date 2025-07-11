import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userIds?: string[];
  userType?: 'all' | 'models' | 'clients';
  notificationType: string;
  title: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userIds, userType, notificationType, title, message }: NotificationRequest = await req.json();

    console.log('📬 Processing WhatsApp notifications:', { userIds, userType, notificationType });

    let targetUsers: string[] = [];

    if (userIds) {
      targetUsers = userIds;
    } else if (userType) {
      // Buscar usuários baseado no tipo
      let query = supabase
        .from('system_users')
        .select('user_id')
        .eq('is_active', true);

      if (userType === 'models') {
        query = query.eq('user_role', 'modelo');
      } else if (userType === 'clients') {
        query = query.eq('user_role', 'cliente');
      }

      const { data: users } = await query;
      targetUsers = users?.map(u => u.user_id) || [];
    }

    console.log(`📱 Sending notifications to ${targetUsers.length} users`);

    // Processar notificações em lotes
    const results = await Promise.allSettled(
      targetUsers.map(userId => sendNotificationToUser(userId, notificationType, title, message))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Notifications sent: ${successful} successful, ${failed} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      sent: successful,
      failed: failed,
      total: targetUsers.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Notification batch error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendNotificationToUser(
  userId: string, 
  notificationType: string, 
  title: string, 
  message: string
) {
  try {
    // Verificar se usuário tem WhatsApp conectado
    const { data: connection } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_connected', true)
      .single();

    if (!connection) {
      console.log(`❌ No WhatsApp connection for user: ${userId}`);
      return;
    }

    // Chamar função de envio
    const { data, error } = await supabase.functions.invoke('whatsapp-sender', {
      body: {
        userId: userId,
        message: message,
        type: 'notification',
        notificationData: {
          type: notificationType,
          title: title
        }
      }
    });

    if (error) throw error;

    console.log(`✅ Notification sent to user: ${userId}`);
    return data;

  } catch (error) {
    console.error(`❌ Failed to send notification to user ${userId}:`, error);
    throw error;
  }
}

// Função para criar notificações automáticas do sistema
export async function createSystemNotification(
  type: 'appointment_confirmed' | 'payment_received' | 'review_received' | 'model_approved',
  userId: string,
  data: any
) {
  const notifications = {
    appointment_confirmed: {
      title: '📅 Agendamento Confirmado',
      message: `Seu agendamento para ${data.date} às ${data.time} foi confirmado!`
    },
    payment_received: {
      title: '💰 Pagamento Recebido',
      message: `Pagamento de R$ ${data.amount} foi confirmado para o agendamento do dia ${data.date}.`
    },
    review_received: {
      title: '⭐ Nova Avaliação',
      message: `Você recebeu uma nova avaliação de ${data.rating} estrelas!`
    },
    model_approved: {
      title: '✅ Perfil Aprovado',
      message: 'Parabéns! Seu perfil foi aprovado e já está ativo na plataforma.'
    }
  };

  const notification = notifications[type];
  if (!notification) return;

  return sendNotificationToUser(userId, type, notification.title, notification.message);
}