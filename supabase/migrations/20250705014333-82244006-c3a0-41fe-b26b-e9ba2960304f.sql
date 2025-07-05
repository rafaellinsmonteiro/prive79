-- Criar tabela de clientes
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de serviços
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration INTEGER NOT NULL DEFAULT 60, -- em minutos
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de agendamentos
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration INTEGER NOT NULL DEFAULT 60, -- em minutos
  price NUMERIC NOT NULL DEFAULT 0,
  location TEXT,
  observations TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tabela clients
-- Administradores podem gerenciar todos os clientes
CREATE POLICY "Admins can manage all clients" 
ON public.clients 
FOR ALL 
USING (is_admin());

-- Modelos podem gerenciar apenas seus próprios clientes
CREATE POLICY "Models can manage their own clients" 
ON public.clients 
FOR ALL 
USING (
  model_id IN (
    SELECT model_profiles.model_id
    FROM model_profiles
    WHERE model_profiles.user_id = auth.uid()
      AND model_profiles.is_active = true
  )
);

-- Políticas RLS para tabela services
-- Administradores podem gerenciar todos os serviços
CREATE POLICY "Admins can manage all services" 
ON public.services 
FOR ALL 
USING (is_admin());

-- Modelos podem gerenciar apenas seus próprios serviços
CREATE POLICY "Models can manage their own services" 
ON public.services 
FOR ALL 
USING (
  model_id IN (
    SELECT model_profiles.model_id
    FROM model_profiles
    WHERE model_profiles.user_id = auth.uid()
      AND model_profiles.is_active = true
  )
);

-- Políticas RLS para tabela appointments
-- Administradores podem gerenciar todos os agendamentos
CREATE POLICY "Admins can manage all appointments" 
ON public.appointments 
FOR ALL 
USING (is_admin());

-- Modelos podem gerenciar apenas seus próprios agendamentos
CREATE POLICY "Models can manage their own appointments" 
ON public.appointments 
FOR ALL 
USING (
  model_id IN (
    SELECT model_profiles.model_id
    FROM model_profiles
    WHERE model_profiles.user_id = auth.uid()
      AND model_profiles.is_active = true
  )
);

-- Criar índices para melhor performance
CREATE INDEX idx_clients_model_id ON public.clients(model_id);
CREATE INDEX idx_clients_active ON public.clients(is_active);
CREATE INDEX idx_services_model_id ON public.services(model_id);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_appointments_model_id ON public.appointments(model_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();