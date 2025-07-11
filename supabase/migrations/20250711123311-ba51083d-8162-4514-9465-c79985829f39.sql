-- Criar tabela para conexões WhatsApp
CREATE TABLE public.whatsapp_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  instance_id TEXT NOT NULL,
  is_connected BOOLEAN NOT NULL DEFAULT false,
  qr_code TEXT,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para notificações WhatsApp
CREATE TABLE public.whatsapp_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  whatsapp_message_id TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campo source nas mensagens para identificar origem
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'internal';
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS whatsapp_message_id TEXT;

-- Enable RLS
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para whatsapp_connections
CREATE POLICY "Users can view their own WhatsApp connections"
ON public.whatsapp_connections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WhatsApp connections"
ON public.whatsapp_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WhatsApp connections"
ON public.whatsapp_connections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all WhatsApp connections"
ON public.whatsapp_connections
FOR ALL
USING (is_admin());

-- Políticas para whatsapp_notifications
CREATE POLICY "Users can view their own WhatsApp notifications"
ON public.whatsapp_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create WhatsApp notifications"
ON public.whatsapp_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update WhatsApp notifications"
ON public.whatsapp_notifications
FOR UPDATE
USING (true);

CREATE POLICY "Admins can manage all WhatsApp notifications"
ON public.whatsapp_notifications
FOR ALL
USING (is_admin());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_whatsapp_connections_updated_at
BEFORE UPDATE ON public.whatsapp_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_whatsapp_connections_user_id ON public.whatsapp_connections(user_id);
CREATE INDEX idx_whatsapp_connections_phone ON public.whatsapp_connections(phone_number);
CREATE INDEX idx_whatsapp_notifications_user_id ON public.whatsapp_notifications(user_id);
CREATE INDEX idx_whatsapp_notifications_status ON public.whatsapp_notifications(status);
CREATE INDEX idx_messages_source ON public.messages(source);
CREATE INDEX idx_messages_whatsapp_id ON public.messages(whatsapp_message_id);