-- Criar tabela de pagamentos
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para pagamentos
CREATE POLICY "Models can manage payments for their appointments" 
ON public.payments 
FOR ALL 
USING (
  appointment_id IN (
    SELECT a.id 
    FROM appointments a
    WHERE a.model_id IN (
      SELECT model_profiles.model_id
      FROM model_profiles
      WHERE model_profiles.user_id = auth.uid() 
      AND model_profiles.is_active = true
    )
  )
);

CREATE POLICY "Admins can manage all payments" 
ON public.payments 
FOR ALL 
USING (is_admin());

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar foreign key constraint
ALTER TABLE public.payments 
ADD CONSTRAINT payments_appointment_id_fkey 
FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;

-- Modificar a tabela appointments para incluir status de pagamento
ALTER TABLE public.appointments 
ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pending';

-- Atualizar constraint do preço para permitir 0
ALTER TABLE public.appointments 
DROP CONSTRAINT IF EXISTS appointments_price_check;

ALTER TABLE public.appointments 
ADD CONSTRAINT appointments_price_check CHECK (price >= 0);