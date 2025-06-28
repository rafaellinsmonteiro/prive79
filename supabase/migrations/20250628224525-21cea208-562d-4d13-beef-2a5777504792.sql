
-- Create model_profiles table to store model profile data
CREATE TABLE public.model_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  model_id UUID REFERENCES public.models NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_id)
);

-- Enable RLS for model_profiles
ALTER TABLE public.model_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for model_profiles
CREATE POLICY "Models can view their own profile" 
  ON public.model_profiles 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Models can update their own profile" 
  ON public.model_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Models can insert their own profile" 
  ON public.model_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create model_dashboard_settings table
CREATE TABLE public.model_dashboard_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID REFERENCES public.models NOT NULL,
  privacy_mode BOOLEAN NOT NULL DEFAULT false,
  auto_approve_photos BOOLEAN NOT NULL DEFAULT false,
  show_online_status BOOLEAN NOT NULL DEFAULT true,
  allow_direct_messages BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(model_id)
);

-- Enable RLS for model_dashboard_settings
ALTER TABLE public.model_dashboard_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for model_dashboard_settings
CREATE POLICY "Models can manage their own dashboard settings" 
  ON public.model_dashboard_settings 
  FOR ALL 
  USING (model_id IN (
    SELECT m.id FROM public.models m 
    JOIN public.model_profiles mp ON m.id = mp.model_id 
    WHERE mp.user_id = auth.uid()
  ));

-- Add RLS policies to allow models to manage their own data
CREATE POLICY "Models can view their own model data" 
  ON public.models 
  FOR SELECT 
  USING (id IN (
    SELECT model_id FROM public.model_profiles 
    WHERE user_id = auth.uid()
  ));

CREATE POLICY "Models can update their own model data" 
  ON public.models 
  FOR UPDATE 
  USING (id IN (
    SELECT model_id FROM public.model_profiles 
    WHERE user_id = auth.uid()
  ));

-- Add policies for models to manage their own photos
CREATE POLICY "Models can manage their own photos" 
  ON public.model_photos 
  FOR ALL 
  USING (model_id IN (
    SELECT model_id FROM public.model_profiles 
    WHERE user_id = auth.uid()
  ));

-- Add policies for models to manage their own videos
CREATE POLICY "Models can manage their own videos" 
  ON public.model_videos 
  FOR ALL 
  USING (model_id IN (
    SELECT model_id FROM public.model_profiles 
    WHERE user_id = auth.uid()
  ));
