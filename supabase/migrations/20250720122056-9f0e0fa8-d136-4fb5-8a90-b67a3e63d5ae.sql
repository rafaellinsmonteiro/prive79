
-- Add allow_online_booking column to services table
ALTER TABLE public.services 
ADD COLUMN allow_online_booking boolean NOT NULL DEFAULT false;

-- Create RLS policy to allow public read access to services with online booking enabled
CREATE POLICY "Public can view services with online booking enabled" 
ON public.services 
FOR SELECT 
USING (allow_online_booking = true AND is_active = true);

-- Create RLS policy to allow public read access to active models that have online bookable services
CREATE POLICY "Public can view models with online bookable services" 
ON public.models 
FOR SELECT 
USING (
  is_active = true 
  AND EXISTS (
    SELECT 1 FROM public.services 
    WHERE services.model_id = models.id 
    AND services.allow_online_booking = true 
    AND services.is_active = true
  )
);

-- Create clients table for storing client information from public bookings
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Allow models to view clients who have appointments with them
CREATE POLICY "Models can view their clients" 
ON public.clients 
FOR SELECT 
USING (
  id IN (
    SELECT DISTINCT a.client_id 
    FROM appointments a 
    WHERE a.model_id IN (
      SELECT model_profiles.model_id
      FROM model_profiles
      WHERE model_profiles.user_id = auth.uid() AND model_profiles.is_active = true
    )
  )
);

-- Allow admins to manage all clients
CREATE POLICY "Admins can manage all clients" 
ON public.clients 
FOR ALL 
USING (is_admin());

-- Allow public insert for new clients (for booking system)
CREATE POLICY "Public can create clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (true);

-- Create trigger to update updated_at on clients
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
