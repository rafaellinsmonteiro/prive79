-- Add location fields to services table
ALTER TABLE public.services 
ADD COLUMN location_types TEXT[] DEFAULT ARRAY['online'],
ADD COLUMN service_address TEXT;

-- Update the table comment
COMMENT ON COLUMN public.services.location_types IS 'Array of location options: online, my_address, client_address';
COMMENT ON COLUMN public.services.service_address IS 'Address when my_address is selected as location type';