
-- Create custom_sections table
CREATE TABLE public.custom_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add section column to custom_fields table if it doesn't exist
ALTER TABLE public.custom_fields 
ADD COLUMN IF NOT EXISTS section TEXT DEFAULT 'Campos Personalizados';

-- Create index on section column for better performance
CREATE INDEX IF NOT EXISTS idx_custom_fields_section ON public.custom_fields(section);
CREATE INDEX IF NOT EXISTS idx_custom_sections_display_order ON public.custom_sections(display_order);
