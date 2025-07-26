-- Permitir que a IA (Lunna) envie mensagens nas conversas
-- Adicionar política para permitir inserções de IA

CREATE POLICY "AI can send messages to conversations" 
ON public.messages 
FOR INSERT 
WITH CHECK (
  sender_type = 'ai' AND
  sender_id = '00000000-0000-0000-0000-000000000001'::uuid
);