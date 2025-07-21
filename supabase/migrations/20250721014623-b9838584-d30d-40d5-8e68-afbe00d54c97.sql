-- Criar política para permitir acesso público às configurações de agendamento online ativas
CREATE POLICY "Allow public read access to active booking settings" 
ON public.model_online_booking_settings 
FOR SELECT 
USING (is_enabled = true);