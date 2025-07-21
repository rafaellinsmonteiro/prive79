-- Criar tabela para configurações de agendamento online das modelos
CREATE TABLE public.model_online_booking_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  custom_slug TEXT UNIQUE,
  require_account BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.model_online_booking_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for model online booking settings
CREATE POLICY "Admins can manage all online booking settings" 
ON public.model_online_booking_settings 
FOR ALL 
USING (is_admin());

CREATE POLICY "Models can manage their own online booking settings" 
ON public.model_online_booking_settings 
FOR ALL 
USING (model_id IN (
  SELECT model_profiles.model_id
  FROM model_profiles
  WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_model_online_booking_settings_updated_at
BEFORE UPDATE ON public.model_online_booking_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add constraint to ensure slug follows a pattern (only letters, numbers, and hyphens)
ALTER TABLE public.model_online_booking_settings 
ADD CONSTRAINT valid_slug_format 
CHECK (custom_slug ~ '^[a-z0-9\-]+$');

-- Add comment
COMMENT ON COLUMN public.model_online_booking_settings.custom_slug IS 'Slug personalizado para URL de agendamento (apenas letras minúsculas, números e hífens)';
COMMENT ON COLUMN public.model_online_booking_settings.require_account IS 'Se verdadeiro, apenas clientes com conta podem agendar';