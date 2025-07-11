-- Adicionar campos para gestão de agendamentos pelo admin
ALTER TABLE public.appointments 
ADD COLUMN created_by_admin boolean DEFAULT false,
ADD COLUMN recurrence_type text CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')) DEFAULT 'none',
ADD COLUMN recurrence_end_date date,
ADD COLUMN parent_appointment_id uuid REFERENCES public.appointments(id),
ADD COLUMN admin_notes text,
ADD COLUMN is_recurring_series boolean DEFAULT false;

-- Criar tabela para comentários dos agendamentos
CREATE TABLE public.appointment_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  comment text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para anexos dos agendamentos
CREATE TABLE public.appointment_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  file_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointment_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_attachments ENABLE ROW LEVEL SECURITY;

-- RLS para comentários
CREATE POLICY "Admins can manage all appointment comments" 
ON public.appointment_comments FOR ALL 
USING (is_admin());

CREATE POLICY "Models can manage comments on their appointments" 
ON public.appointment_comments FOR ALL 
USING (
  appointment_id IN (
    SELECT a.id 
    FROM appointments a 
    WHERE a.model_id IN (
      SELECT model_profiles.model_id 
      FROM model_profiles 
      WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
    )
  )
);

-- RLS para anexos
CREATE POLICY "Admins can manage all appointment attachments" 
ON public.appointment_attachments FOR ALL 
USING (is_admin());

CREATE POLICY "Models can manage attachments on their appointments" 
ON public.appointment_attachments FOR ALL 
USING (
  appointment_id IN (
    SELECT a.id 
    FROM appointments a 
    WHERE a.model_id IN (
      SELECT model_profiles.model_id 
      FROM model_profiles 
      WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
    )
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_appointment_comments_updated_at
  BEFORE UPDATE ON public.appointment_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar agendamentos recorrentes
CREATE OR REPLACE FUNCTION public.create_recurring_appointments(
  _appointment_id uuid,
  _recurrence_type text,
  _recurrence_end_date date
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _original_appointment appointments%ROWTYPE;
  _current_date date;
  _interval_text text;
BEGIN
  -- Buscar o agendamento original
  SELECT * INTO _original_appointment FROM appointments WHERE id = _appointment_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Appointment not found';
  END IF;
  
  -- Definir o intervalo baseado no tipo de recorrência
  CASE _recurrence_type
    WHEN 'daily' THEN _interval_text := '1 day';
    WHEN 'weekly' THEN _interval_text := '1 week';
    WHEN 'monthly' THEN _interval_text := '1 month';
    ELSE RAISE EXCEPTION 'Invalid recurrence type';
  END CASE;
  
  -- Criar agendamentos recorrentes
  _current_date := _original_appointment.appointment_date;
  
  LOOP
    _current_date := _current_date + _interval_text::interval;
    
    -- Parar se a data ultrapassar o limite
    IF _current_date > _recurrence_end_date THEN
      EXIT;
    END IF;
    
    -- Criar novo agendamento
    INSERT INTO appointments (
      model_id, client_id, service_id, appointment_date, appointment_time,
      duration, price, status, payment_status, location, observations,
      created_by_admin, recurrence_type, parent_appointment_id, admin_notes
    ) VALUES (
      _original_appointment.model_id, _original_appointment.client_id, 
      _original_appointment.service_id, _current_date, _original_appointment.appointment_time,
      _original_appointment.duration, _original_appointment.price, 
      _original_appointment.status, _original_appointment.payment_status,
      _original_appointment.location, _original_appointment.observations,
      _original_appointment.created_by_admin, 'none', _appointment_id, 
      _original_appointment.admin_notes
    );
  END LOOP;
  
  -- Marcar o agendamento original como série recorrente
  UPDATE appointments 
  SET is_recurring_series = true, 
      recurrence_type = _recurrence_type,
      recurrence_end_date = _recurrence_end_date
  WHERE id = _appointment_id;
END;
$$;