-- Criar tabela para rastrear depósitos PIX
CREATE TABLE public.pix_deposits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  pix_id TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMP WITH TIME ZONE,
  br_code TEXT,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.pix_deposits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own PIX deposits" 
ON public.pix_deposits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own PIX deposits" 
ON public.pix_deposits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all PIX deposits" 
ON public.pix_deposits 
FOR ALL 
USING (public.is_admin());

-- Trigger para updated_at
CREATE TRIGGER update_pix_deposits_updated_at
BEFORE UPDATE ON public.pix_deposits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_pix_deposits_user_id ON public.pix_deposits(user_id);
CREATE INDEX idx_pix_deposits_pix_id ON public.pix_deposits(pix_id);
CREATE INDEX idx_pix_deposits_status ON public.pix_deposits(status);
CREATE INDEX idx_pix_deposits_created_at ON public.pix_deposits(created_at);