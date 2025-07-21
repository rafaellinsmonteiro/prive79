-- Adicionar coluna de quantidade máxima de pessoas nos serviços
ALTER TABLE public.services ADD COLUMN max_people integer DEFAULT 1 NOT NULL;

-- Adicionar coluna de origem no agendamento para marcar agendamentos da página pública
ALTER TABLE public.appointments ADD COLUMN booking_source text DEFAULT 'admin' NOT NULL;

-- Comentário para explicar os valores possíveis
COMMENT ON COLUMN public.appointments.booking_source IS 'Origem do agendamento: admin (criado pelo admin/modelo), public (página pública de agendamento)';
COMMENT ON COLUMN public.services.max_people IS 'Quantidade máxima de pessoas permitidas neste serviço (incluindo o cliente principal)';