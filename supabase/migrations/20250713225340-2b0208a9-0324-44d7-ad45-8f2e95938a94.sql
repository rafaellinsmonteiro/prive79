-- Add online status fields to models table
ALTER TABLE public.models 
ADD COLUMN is_online boolean DEFAULT false,
ADD COLUMN manual_status_override boolean DEFAULT false,
ADD COLUMN last_status_update timestamp with time zone DEFAULT now();

-- Create working hours table for models
CREATE TABLE public.model_working_hours (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id uuid NOT NULL REFERENCES public.models(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on model_working_hours
ALTER TABLE public.model_working_hours ENABLE ROW LEVEL SECURITY;

-- Create policies for model_working_hours
CREATE POLICY "Admins can manage all working hours"
ON public.model_working_hours
FOR ALL
TO authenticated
USING (is_admin());

CREATE POLICY "Models can manage their own working hours"
ON public.model_working_hours
FOR ALL
TO authenticated
USING (
  model_id IN (
    SELECT model_profiles.model_id
    FROM model_profiles
    WHERE model_profiles.user_id = auth.uid()
    AND model_profiles.is_active = true
  )
);

-- Create trigger for updating updated_at on model_working_hours
CREATE TRIGGER update_model_working_hours_updated_at
  BEFORE UPDATE ON public.model_working_hours
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if model should be online based on working hours
CREATE OR REPLACE FUNCTION public.check_model_should_be_online(model_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.model_working_hours mwh
    WHERE mwh.model_id = model_id_param
    AND mwh.is_active = true
    AND mwh.day_of_week = EXTRACT(DOW FROM now())
    AND now()::time BETWEEN mwh.start_time AND mwh.end_time
  );
$$;

-- Create function to update model online status based on working hours
CREATE OR REPLACE FUNCTION public.update_model_online_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update models that should be online but aren't (and don't have manual override)
  UPDATE public.models 
  SET 
    is_online = true,
    last_status_update = now()
  WHERE 
    manual_status_override = false
    AND is_online = false
    AND public.check_model_should_be_online(id) = true;
    
  -- Update models that should be offline but aren't (and don't have manual override)
  UPDATE public.models 
  SET 
    is_online = false,
    last_status_update = now()
  WHERE 
    manual_status_override = false
    AND is_online = true
    AND public.check_model_should_be_online(id) = false;
END;
$$;